<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\ImportHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ImportController extends Controller
{
    private const MAX_ERRORS = 10;

    private const MAX_PREVIEW_ROWS = 5;

    private const MAX_HISTORY = 20;

    public function index(Request $request): Response
    {
        $history = ImportHistory::query()
            ->with('user:id,name')
            ->latest()
            ->limit(self::MAX_HISTORY)
            ->get()
            ->map(fn (ImportHistory $h) => $h->toDisplayArray())
            ->values();

        return Inertia::render('Admin/Academy/Import/Index', [
            // Flash-only: preview/result survive exactly one redirect, which
            // is the upload → preview → confirm flow.
            'preview' => $request->session()->get('import_preview'),
            'result' => $request->session()->get('import_result'),
            'history' => $history,
        ]);
    }

    /**
     * Step 1: validate + store the upload, parse it, and return a preview
     * (row count, first rows, first errors). Nothing is created yet.
     */
    public function preview(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:2048'],
        ]);

        $file = $request->file('file');
        $token = Str::random(32).'.csv';
        $path = 'imports/'.$token;

        Storage::disk('local')->put($path, file_get_contents($file->getRealPath()));
        // Sidecar: confirm() only receives the token, so the original
        // filename is kept next to the stored file for the history record.
        Storage::disk('local')->put($path.'.meta', json_encode([
            'filename' => $file->getClientOriginalName(),
        ]));

        $parsed = $this->parseCsv(Storage::disk('local')->path($path));

        return back()->with('import_preview', [
            'token' => $token,
            'filename' => $file->getClientOriginalName(),
            'total_rows' => $parsed['total_rows'],
            'valid_rows' => $parsed['valid_rows'],
            'errors' => $parsed['errors'],
            'sample' => array_slice($parsed['rows'], 0, self::MAX_PREVIEW_ROWS),
        ]);
    }

    /**
     * Step 2: re-parse the stored file and create Course records. Rows with a
     * missing title are skipped; unknown categories are created.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'regex:/^[A-Za-z0-9]+\.csv$/'],
        ]);

        $path = 'imports/'.$data['token'];

        if (! Storage::disk('local')->exists($path)) {
            return back()->withErrors(['file' => 'Upload လုပ်ထားသော ဖိုင် မတွေ့တော့ပါ — ထပ်တင် ကြည့်ပါ။']);
        }

        $parsed = $this->parseCsv(Storage::disk('local')->path($path));

        $filename = $data['token'];
        if (Storage::disk('local')->exists($path.'.meta')) {
            $meta = json_decode(Storage::disk('local')->get($path.'.meta'), true);
            $filename = is_array($meta) && isset($meta['filename']) ? (string) $meta['filename'] : $filename;
        }

        $created = 0;
        $skipped = 0;
        $errors = [];

        foreach ($parsed['rows'] as $row) {
            if ($row['title'] === '') {
                $skipped++;
                $errors[] = 'လိုင်း '.$row['line'].': ခေါင်းစဉ် မပါပါ';
                continue;
            }

            $category = $this->resolveCategory($row['category']);

            Course::create([
                'category_id' => $category->id,
                'instructor_id' => $request->user()->id,
                'title' => $row['title'],
                'slug' => $this->uniqueSlug($row['title']),
                'price' => $row['price'],
                'level' => $row['level'],
                'status' => 'draft',
            ]);

            $created++;
        }

        // Rows rejected at parse time (bad price etc.) count as failed.
        $failed = $parsed['total_rows'] - count($parsed['rows']);
        $errors = array_merge($errors, array_slice($parsed['errors'], 0, self::MAX_ERRORS));
        $errors = array_slice($errors, 0, self::MAX_ERRORS);

        ImportHistory::create([
            'user_id' => $request->user()->id,
            'filename' => $filename,
            'status' => ImportHistory::statusForOutcome($created, $skipped, $failed),
            'rows_total' => $parsed['total_rows'],
            'rows_imported' => $created,
            'rows_skipped' => $skipped,
            'rows_failed' => $failed,
            'errors' => $errors,
        ]);

        Storage::disk('local')->delete([$path, $path.'.meta']);

        return back()->with('import_result', [
            'created' => $created,
            'skipped' => $skipped,
            'failed' => $failed,
            'errors' => $errors,
            'date' => now()->format('Y-m-d H:i'),
        ])->with('success', $created.' သင်တန်း သွင်းပြီးပါပြီ'.($skipped ? ' · '.$skipped.' ကြောင်း ကျော်သွားပါတယ်' : '').'။');
    }

    /**
     * Parse a CSV file with native PHP. Supports an optional header row
     * (title, category, price, level — any order) or positional columns:
     * title, category, price, level.
     *
     * @return array{total_rows: int, valid_rows: int, rows: array<int, array{line: int, title: string, category: string, price: float, level: string}>, errors: array<int, string>}
     */
    private function parseCsv(string $fullPath): array
    {
        $handle = fopen($fullPath, 'r');
        $rows = [];
        $errors = [];
        $total = 0;
        $lineNo = 0;
        $columns = null;

        if ($handle === false) {
            return ['total_rows' => 0, 'valid_rows' => 0, 'rows' => [], 'errors' => ['ဖိုင် ဖတ်၍ မရပါ။']];
        }

        while (($fields = fgetcsv($handle)) !== false) {
            $lineNo++;
            $fields = array_map(fn ($v) => trim((string) $v), $fields);

            // Skip fully empty lines.
            if (count(array_filter($fields, fn ($v) => $v !== '')) === 0) {
                continue;
            }

            // First non-empty row may be a header row.
            if ($columns === null) {
                $lower = array_map(fn ($v) => Str::lower($v), $fields);
                if (in_array('title', $lower, true)) {
                    $columns = $lower;
                    continue;
                }
                $columns = ['title', 'category', 'price', 'level'];
            }

            $total++;
            $row = $this->mapRow($fields, $columns, $lineNo);

            if ($row['error'] !== null) {
                $errors[] = $row['error'];
                continue;
            }

            $rows[] = $row['data'];
        }

        fclose($handle);

        return [
            'total_rows' => $total,
            'valid_rows' => count($rows),
            'rows' => $rows,
            'errors' => array_slice($errors, 0, self::MAX_ERRORS),
        ];
    }

    /**
     * @param  array<int, string>  $fields
     * @param  array<int, string>  $columns
     * @return array{data: array{line: int, title: string, category: string, price: float, level: string}|null, error: string|null}
     */
    private function mapRow(array $fields, array $columns, int $lineNo): array
    {
        $get = function (string $name) use ($fields, $columns): string {
            $idx = array_search($name, $columns, true);

            return $idx === false ? '' : ($fields[$idx] ?? '');
        };

        $title = $get('title');
        $priceRaw = str_replace([',', ' '], '', $get('price'));

        if ($priceRaw !== '' && ! is_numeric($priceRaw)) {
            return ['data' => null, 'error' => 'လိုင်း '.$lineNo.': ဈေးနှုန်း မမှန်ပါ — "'.$get('price').'"'];
        }

        $level = Str::lower($get('level'));
        if (! in_array($level, ['beginner', 'intermediate', 'advanced'], true)) {
            $level = 'beginner';
        }

        return [
            'data' => [
                'line' => $lineNo,
                'title' => $title,
                'category' => $get('category'),
                'price' => $priceRaw === '' ? 0.0 : (float) $priceRaw,
                'level' => $level,
            ],
            'error' => null,
        ];
    }

    private function resolveCategory(string $name): CourseCategory
    {
        $name = $name !== '' ? $name : 'General';

        return CourseCategory::firstOrCreate(
            ['slug' => Str::slug($name)],
            ['name' => $name, 'is_active' => true],
        );
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'course';
        $slug = $base;
        $i = 2;

        while (Course::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
