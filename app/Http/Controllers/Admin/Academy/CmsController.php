<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsController extends Controller
{
    /**
     * Landing-page content keys with defaults. This only persists the
     * content; the public landing page does not read these settings yet,
     * so wiring it up is separate follow-up work.
     */
    public static function defaults(): array
    {
        return [
            'landing_promo' => ['value' => '🎉 50% OFF — သင်တန်း အားလုံး · CODEXA10 code သုံးပါ', 'group' => 'landing'],
            'landing_hero_title' => ['value' => 'မြန်မာဘာသာနဲ့ Programming ကို သုညကနေ သင်ယူပါ', 'group' => 'landing'],
            'landing_hero_intro' => ['value' => 'Codexa MM မှာ Web Development, Python, React, Mobile App တွေကို မြန်မာဘာသာနဲ့ လွယ်ကူရှင်းလင်းစွာ သင်ယူနိုင်ပါတယ်။ Live class, Assignment နဲ့ Certificate တွေ အပြည့်အစုံ ပါဝင်ပါတယ်။', 'group' => 'landing'],
        ];
    }

    public function index(): Response
    {
        Setting::ensureDefaults(static::defaults());

        return Inertia::render('Admin/Academy/Cms/Index', [
            'content' => [
                'promo' => Setting::getValue('landing_promo', static::defaults()['landing_promo']['value']),
                'heroTitle' => Setting::getValue('landing_hero_title', static::defaults()['landing_hero_title']['value']),
                'heroIntro' => Setting::getValue('landing_hero_intro', static::defaults()['landing_hero_intro']['value']),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'promo' => ['required', 'string', 'max:255'],
            'heroTitle' => ['required', 'string', 'max:255'],
            'heroIntro' => ['required', 'string', 'max:2000'],
        ]);

        Setting::setValue('landing_promo', $validated['promo'], 'landing');
        Setting::setValue('landing_hero_title', $validated['heroTitle'], 'landing');
        Setting::setValue('landing_hero_intro', $validated['heroIntro'], 'landing');

        return redirect()->back()->with('success', 'Landing page content saved.');
    }
}
