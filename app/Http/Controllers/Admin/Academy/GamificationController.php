<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GamificationController extends Controller
{
    /**
     * XP rule keys with their labels (as shown in the UI) and defaults.
     * There is no Badge model: badge definitions live in the settings
     * table as a single JSON setting ('badges').
     */
    public static function xpRules(): array
    {
        return [
            'xp_lesson_complete' => ['label' => 'သင်ခန်းစာ ၁ ခု ပြီးဆုံးခြင်း', 'value' => 20],
            'xp_quiz_pass' => ['label' => 'Quiz အောင်မြင်ခြင်း', 'value' => 50],
            'xp_assignment_submit' => ['label' => 'Assignment တင်သွင်းခြင်း', 'value' => 80],
            'xp_live_attend' => ['label' => 'Live class တက်ရောက်ခြင်း', 'value' => 40],
            'xp_challenge_complete' => ['label' => 'Code Challenge အောင်မြင်ခြင်း', 'value' => 30],
            'xp_streak_bonus' => ['label' => 'နေ့စဉ် streak bonus', 'value' => 10],
        ];
    }

    public static function defaultBadges(): array
    {
        return [
            ['name' => 'First Steps', 'desc' => 'ပထမဆုံး သင်ခန်းစာ ပြီးဆုံးခြင်း', 'xp' => 20, 'icon' => '🎯', 'active' => true],
            ['name' => 'Quiz Master', 'desc' => 'Quiz 10 ခု အောင်မြင်ခြင်း', 'xp' => 100, 'icon' => '🧠', 'active' => true],
            ['name' => 'Streak 7', 'desc' => '၇ ရက် ဆက်တိုက် သင်ယူခြင်း', 'xp' => 70, 'icon' => '🔥', 'active' => true],
            ['name' => 'Project Builder', 'desc' => 'Assignment 5 ခု တင်သွင်းခြင်း', 'xp' => 150, 'icon' => '🛠️', 'active' => true],
            ['name' => 'Live Learner', 'desc' => 'Live class 5 ခု တက်ရောက်ခြင်း', 'xp' => 80, 'icon' => '📺', 'active' => true],
            ['name' => 'Course Completer', 'desc' => 'သင်တန်း ၁ ခု အပြီးသတ်ခြင်း', 'xp' => 200, 'icon' => '🎓', 'active' => true],
        ];
    }

    public function index(): Response
    {
        $defaults = ['badges' => ['value' => static::defaultBadges(), 'group' => 'gamification']];
        foreach (static::xpRules() as $key => $rule) {
            $defaults[$key] = ['value' => $rule['value'], 'group' => 'gamification'];
        }
        Setting::ensureDefaults($defaults);

        $xpRules = [];
        foreach (static::xpRules() as $key => $rule) {
            $xpRules[] = [
                'key' => $key,
                'label' => $rule['label'],
                'xp' => Setting::getValue($key, $rule['value']),
            ];
        }

        return Inertia::render('Admin/Academy/Gamification/Index', [
            'badges' => Setting::getValue('badges', static::defaultBadges()),
            'xpRules' => $xpRules,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $rules = [
            'badges' => ['sometimes', 'array'],
            'badges.*.name' => ['required', 'string', 'max:255'],
            'badges.*.desc' => ['nullable', 'string', 'max:500'],
            'badges.*.xp' => ['required', 'integer', 'min:0', 'max:100000'],
            'badges.*.icon' => ['nullable', 'string', 'max:10'],
            'badges.*.active' => ['sometimes', 'boolean'],
        ];
        foreach (array_keys(static::xpRules()) as $key) {
            $rules[$key] = ['sometimes', 'integer', 'min:0', 'max:100000'];
        }

        $validated = $request->validate($rules);

        if (array_key_exists('badges', $validated)) {
            // Cast explicitly: form-encoded requests deliver ints/booleans
            // as strings, and the stored JSON should carry real types.
            $badges = array_map(fn (array $badge) => [
                'name' => $badge['name'],
                'desc' => $badge['desc'] ?? '',
                'xp' => (int) $badge['xp'],
                'icon' => $badge['icon'] ?? '🏅',
                'active' => (bool) ($badge['active'] ?? true),
            ], $validated['badges']);
            Setting::setValue('badges', $badges, 'gamification');
        }

        foreach (array_keys(static::xpRules()) as $key) {
            if (array_key_exists($key, $validated)) {
                Setting::setValue($key, (int) $validated[$key], 'gamification');
            }
        }

        return redirect()->back()->with('success', 'Gamification settings saved.');
    }
}
