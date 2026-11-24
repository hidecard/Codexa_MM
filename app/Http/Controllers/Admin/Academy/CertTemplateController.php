<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CertificateTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertTemplateController extends Controller
{
    private static function defaultDesign(string $color, string $accent): array
    {
        return [
            'title' => 'Certificate of Completion',
            'subtitle' => 'ဤ လက်မှတ်ကို အောက်ပါ ကျောင်းသားအား ပေးအပ်ပါသည်',
            'signer' => 'Thura Aung',
            'signer_role' => 'Founder & Lead Instructor, Codexa MM',
            'color' => $color,
            'accent' => $accent,
        ];
    }

    private static function seedDefaults(): void
    {
        if (CertificateTemplate::query()->exists()) {
            return;
        }

        CertificateTemplate::create([
            'name' => 'Classic Navy',
            'design_config' => static::defaultDesign('#0d1730', '#0ea892'),
            'is_default' => true,
        ]);
        CertificateTemplate::create([
            'name' => 'Teal Modern',
            'design_config' => static::defaultDesign('#078575', '#2dd4bf'),
            'is_default' => false,
        ]);
        CertificateTemplate::create([
            'name' => 'Gold Premium',
            'design_config' => static::defaultDesign('#451a03', '#f59e0b'),
            'is_default' => false,
        ]);
    }

    public function index(): Response
    {
        static::seedDefaults();

        $templates = CertificateTemplate::query()
            ->orderByDesc('is_default')
            ->orderBy('id')
            ->get()
            ->map(fn (CertificateTemplate $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'is_default' => $t->is_default,
                'design_config' => array_merge(
                    static::defaultDesign('#0d1730', '#0ea892'),
                    $t->design_config ?? [],
                ),
            ])->values();

        return Inertia::render('Admin/Academy/CertTemplate/Index', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'design_config' => ['required', 'array'],
            'design_config.title' => ['nullable', 'string', 'max:255'],
            'design_config.subtitle' => ['nullable', 'string', 'max:500'],
            'design_config.signer' => ['nullable', 'string', 'max:255'],
            'design_config.signer_role' => ['nullable', 'string', 'max:255'],
            'design_config.color' => ['nullable', 'string', 'max:20'],
            'design_config.accent' => ['nullable', 'string', 'max:20'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        if ($validated['is_default'] ?? false) {
            CertificateTemplate::query()->update(['is_default' => false]);
        }

        CertificateTemplate::create([
            'name' => $validated['name'],
            'design_config' => $validated['design_config'],
            'is_default' => (bool) ($validated['is_default'] ?? false),
        ]);

        return redirect()->back()->with('success', 'Certificate template created.');
    }

    public function update(Request $request, CertificateTemplate $certificateTemplate): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'design_config' => ['sometimes', 'required', 'array'],
            'design_config.title' => ['nullable', 'string', 'max:255'],
            'design_config.subtitle' => ['nullable', 'string', 'max:500'],
            'design_config.signer' => ['nullable', 'string', 'max:255'],
            'design_config.signer_role' => ['nullable', 'string', 'max:255'],
            'design_config.color' => ['nullable', 'string', 'max:20'],
            'design_config.accent' => ['nullable', 'string', 'max:20'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        $certificateTemplate->update([
            'name' => $validated['name'] ?? $certificateTemplate->name,
            'design_config' => $validated['design_config'] ?? $certificateTemplate->design_config,
        ]);

        // A template can only become the default here; unsetting the default
        // happens implicitly by making another template the default.
        if ($validated['is_default'] ?? false) {
            $certificateTemplate->makeDefault();
        }

        return redirect()->back()->with('success', 'Certificate template saved.');
    }

    public function destroy(CertificateTemplate $certificateTemplate): RedirectResponse
    {
        if ($certificateTemplate->is_default) {
            return redirect()->back()->withErrors(['template' => 'The default template cannot be deleted. Make another template the default first.']);
        }

        $certificateTemplate->delete();

        return redirect()->back()->with('success', 'Certificate template deleted.');
    }

    public function setDefault(CertificateTemplate $certificateTemplate): RedirectResponse
    {
        $certificateTemplate->makeDefault();

        return redirect()->back()->with('success', 'Default certificate template updated.');
    }
}
