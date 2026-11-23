<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GamificationController extends Controller
{
    /**
     * XP rule keys with their labels (as shown in the UI) and defaults.
     * XP rules stay in settings; badges live in the Badge model (see
     * index()), which is the single source of truth for badge
     * definitions — the legacy settings-JSON 'badges' setting is
     * migrated into Badge records on first visit and then deleted.
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

    /** Badge rule types with the labels and units shown in the admin UI. */
    public static function ruleTypes(): array
    {
        return [
            Badge::RULE_XP_THRESHOLD => ['label' => 'XP စုစုပေါင်း', 'unit' => 'XP'],
            Badge::RULE_LESSONS_COMPLETED => ['label' => 'သင်ခန်းစာ ပြီးဆုံးခြင်း', 'unit' => 'ခု'],
            Badge::RULE_QUIZZES_PASSED => ['label' => 'Quiz အောင်မြင်ခြင်း', 'unit' => 'ခု'],
            Badge::RULE_ASSIGNMENTS_SUBMITTED => ['label' => 'Assignment တင်သွင်းခြင်း', 'unit' => 'ခု'],
            Badge::RULE_COURSES_COMPLETED => ['label' => 'သင်တန်း ပြီးဆုံးခြင်း', 'unit' => 'ခု'],
        ];
    }

    public function index(): Response
    {
        $defaults = [];
        foreach (static::xpRules() as $key => $rule) {
            $defaults[$key] = ['value' => $rule['value'], 'group' => 'gamification'];
        }
        Setting::ensureDefaults($defaults);

        Badge::ensureSeeded();
        $this->migrateLegacyBadges();

        $xpRules = [];
        foreach (static::xpRules() as $key => $rule) {
            $xpRules[] = [
                'key' => $key,
                'label' => $rule['label'],
                'xp' => Setting::getValue($key, $rule['value']),
            ];
        }

        return Inertia::render('Admin/Academy/Gamification/Index', [
            'badges' => Badge::query()->orderBy('id')->get()->map(fn (Badge $badge) => [
                'id' => $badge->id,
                'name' => $badge->name,
                'description' => $badge->description ?? '',
                'icon' => $badge->icon,
                'rule_type' => $badge->rule_type,
                'threshold' => $badge->threshold,
                'is_active' => $badge->is_active,
            ])->values(),
            'xpRules' => $xpRules,
            'ruleTypes' => collect(static::ruleTypes())
                ->map(fn (array $rule, string $value) => ['value' => $value] + $rule)
                ->values(),
            'icons' => Badge::ICONS,
        ]);
    }

    /** XP rules only; badges are managed through the badge endpoints. */
    public function update(Request $request): RedirectResponse
    {
        $rules = [];
        foreach (array_keys(static::xpRules()) as $key) {
            $rules[$key] = ['sometimes', 'integer', 'min:0', 'max:100000'];
        }

        $validated = $request->validate($rules);

        foreach (array_keys(static::xpRules()) as $key) {
            if (array_key_exists($key, $validated)) {
                Setting::setValue($key, (int) $validated[$key], 'gamification');
            }
        }

        return redirect()->back()->with('success', 'Gamification settings saved.');
    }

    public function storeBadge(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->badgeRules());

        $badge = Badge::query()->create($validated);

        return redirect()->back()->with('success', 'Badge '.$badge->name.' ဖန်တီးပြီးပါပြီ။');
    }

    public function updateBadge(Request $request, Badge $badge): RedirectResponse
    {
        $validated = $request->validate($this->badgeRules($badge));

        $badge->update($validated);

        return redirect()->back()->with('success', 'Badge '.$badge->name.' ပြင်ဆင်ပြီးပါပြီ။');
    }

    public function destroyBadge(Badge $badge): RedirectResponse
    {
        $name = $badge->name;
        // Badge awards cascade on delete (see the badge_awards migration).
        $badge->delete();

        return redirect()->back()->with('success', 'Badge '.$name.' ဖျက်ပြီးပါပြီ။');
    }

    public function toggleBadge(Badge $badge): RedirectResponse
    {
        $badge->update(['is_active' => ! $badge->is_active]);

        return redirect()->back()->with('success', 'Badge '.$badge->name.($badge->is_active ? ' ပြန်ဖွင့်ပြီးပါပြီ။' : ' ပိတ်ပြီးပါပြီ။'));
    }

    /**
     * One-time migration of the legacy settings-JSON badges into Badge
     * records. The setting is deleted afterwards so this runs exactly
     * once; Badge::migrateFromJson() also dedupes by badge key, so a
     * re-run could never duplicate.
     */
    private function migrateLegacyBadges(): void
    {
        $legacy = Setting::getValue('badges');

        if (! is_array($legacy)) {
            return;
        }

        Badge::migrateFromJson($legacy);
        Setting::query()->where('key', 'badges')->delete();
    }

    /**
     * @return array<string, mixed>
     */
    private function badgeRules(?Badge $badge = null): array
    {
        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('badges', 'name')->ignore($badge?->id),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'icon' => ['required', 'string', Rule::in(Badge::ICONS)],
            'rule_type' => ['required', 'string', Rule::in(Badge::RULE_TYPES)],
            'threshold' => ['required', 'integer', 'min:1', 'max:1000000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
