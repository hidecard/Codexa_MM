<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\BadgeAward;
use App\Models\Enrollment;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __invoke(Request $request, BadgeService $badges): Response
    {
        $user = $request->user();

        Badge::ensureSeeded();
        $badges->evaluate($user);

        $metrics = $badges->metrics($user);
        $totalXp = $metrics['xp'];
        $streak = $badges->streak($user);

        $awards = BadgeAward::query()
            ->where('user_id', $user->id)
            ->get(['badge_id', 'awarded_at'])
            ->mapWithKeys(fn (BadgeAward $a) => [$a->badge_id => $a->awarded_at]);

        $earnedBadges = Badge::query()
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

        $stats = [
            'enrolled' => Enrollment::query()->where('student_id', $user->id)->count(),
            'watch_hours' => $metrics['lessons_completed'] > 0 ? round($metrics['lessons_completed'] * 0.5, 1) : 0,
            'streak_days' => $streak,
            'certificates' => Enrollment::query()
                ->where('student_id', $user->id)
                ->where('status', 'completed')
                ->count(),
        ];

        return Inertia::render('Student/Profile', [
            'stats' => $stats,
            'badges' => $earnedBadges,
            'totalXp' => $totalXp,
        ]);
    }
}