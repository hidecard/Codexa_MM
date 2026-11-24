<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LessonResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResourceController extends Controller
{
    public function index(Request $request): Response
    {
        $courseIds = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->whereIn('status', ['active', 'completed'])
            ->pluck('course_id');

        $resources = LessonResource::query()
            ->with(['lesson.module.course:id,title'])
            ->whereHas('lesson.module', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->latest()
            ->get()
            ->map(function (LessonResource $resource) {
                $course = $resource->lesson?->module?->course;
                $type = $this->mapType($resource->file_type, $resource->original_name);

                return [
                    'id' => $resource->id,
                    'type' => $type,
                    'label' => $this->typeLabel($type),
                    'title' => $resource->original_name,
                    'course' => $course?->title ?? '—',
                    'courseId' => $course?->id ?? 0,
                    'size' => $this->formatSize((int) $resource->file_size),
                    'meta' => $this->metaLabel($resource->file_type),
                ];
            })->values();

        return Inertia::render('Student/Resources/Index', [
            'resources' => $resources,
        ]);
    }

    /**
     * Download a resource the student is enrolled for. Seeded resources
     * point at paths that may not exist on disk yet — those return the
     * student to the list with an honest message instead of a fake file.
     */
    public function download(Request $request, LessonResource $resource): StreamedResponse|RedirectResponse
    {
        $resource->load('lesson.module.course:id');

        $enrolled = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $resource->lesson?->module?->course_id)
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        abort_unless($enrolled, 403);

        if (! $resource->file_path || ! Storage::disk('local')->exists($resource->file_path)) {
            return back()->withErrors(['download' => 'ဖိုင် မတွေ့ပါ — ဆရာထံ မေးမြန်းပါ။']);
        }

        return Storage::disk('local')->download($resource->file_path, $resource->original_name);
    }

    /** LessonResource has only a MIME type, so map it onto the UI's 4 tabs. */
    private function mapType(?string $mime, ?string $name): string
    {
        $mime = strtolower($mime ?? '');
        $name = strtolower($name ?? '');

        if (str_contains($mime, 'zip') || str_contains($mime, 'x-tar') || str_contains($name, '.zip')) {
            return 'code';
        }
        if (str_contains($mime, 'presentation') || str_contains($mime, 'powerpoint') || str_contains($name, 'slide')) {
            return 'slides';
        }
        if (str_contains($name, 'cheat')) {
            return 'cheat';
        }
        if (str_contains($name, 'worksheet') || str_contains($name, 'exercise')) {
            return 'worksheet';
        }

        return 'cheat';
    }

    private function typeLabel(string $type): string
    {
        return match ($type) {
            'slides' => 'Slides',
            'code' => 'Starter Code',
            'worksheet' => 'Worksheet',
            default => 'Cheat Sheet',
        };
    }

    private function metaLabel(?string $mime): string
    {
        return match (true) {
            str_contains((string) $mime, 'pdf') => 'PDF',
            str_contains((string) $mime, 'zip') => 'ZIP',
            str_contains((string) $mime, 'presentation') => 'Slides',
            str_contains((string) $mime, 'word') => 'Word',
            default => $mime ?: 'File',
        };
    }

    private function formatSize(int $bytes): string
    {
        if ($bytes <= 0) {
            return '—';
        }
        if ($bytes < 1024 * 1024) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / (1024 * 1024), 1).' MB';
    }
}
