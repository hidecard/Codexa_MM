<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\BadgeAward;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function index(Request $request, BadgeService $badges): Response
    {
        $user = $request->user();

        // Award anything newly earned, then present the full badge set
        // with progress towards the locked ones.
        $badges->evaluate($user);

        $metrics = $badges->metrics($user);
        // get() (not pluck) so the awarded_at cast applies.
        $awards = BadgeAward::query()
            ->where('user_id', $user->id)
            ->get(['badge_id', 'awarded_at'])
            ->mapWithKeys(fn (BadgeAward $a) => [$a->badge_id => $a->awarded_at]);

        $achievements = Badge::query()
            ->where('is_active', true)
            ->orderBy('threshold')
            ->get()
            ->map(function (Badge $badge) use ($awards, $badges, $user, $metrics) {
                $earned = $awards->has($badge->id);
                $current = $badges->progressFor($user, $badge, $metrics);
                $unit = match ($badge->rule_type) {
                    Badge::RULE_XP_THRESHOLD => 'XP',
                    Badge::RULE_COURSES_COMPLETED => 'ခု',
                    Badge::RULE_LESSONS_COMPLETED => 'ခု',
                    Badge::RULE_QUIZZES_PASSED => 'ခု',
                    Badge::RULE_ASSIGNMENTS_SUBMITTED => 'ခု',
                    default => '',
                };

                return [
                    'name' => $badge->name,
                    'desc' => $badge->description ?? '',
                    'icon' => $badge->icon,
                    'earned' => $earned,
                    'date' => $earned && $awards->get($badge->id)
                        ? $awards->get($badge->id)->toDateString()
                        : null,
                    'cur' => $current,
                    'total' => $badge->threshold,
                    'unit' => $unit,
                ];
            })->values();

        return Inertia::render('Student/Achievements/Index', [
            'achievements' => $achievements,
            'xpHistory' => $badges->xpHistory($user),
            'totalXp' => $metrics['xp'],
        ]);
    }
}
