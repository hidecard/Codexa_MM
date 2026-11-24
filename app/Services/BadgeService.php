<?php

namespace App\Services;

use App\Http\Controllers\Admin\Academy\GamificationController;
use App\Models\Badge;
use App\Models\BadgeAward;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\QuizAttempt;
use App\Models\Setting;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * XP and badges, derived from real learning activity — there is no stored
 * XP column. XP rules come from the gamification settings (admin-editable),
 * falling back to GamificationController defaults.
 *
 * Counted towards XP: completed lessons, passed quizzes, submitted
 * assignments. Live attendance and challenges have no attendance/completion
 * records, so their rules are not counted here.
 */
class BadgeService
{
    public const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    /**
     * XP rule values as [key => xp], from settings with controller defaults.
     */
    public function xpRules(): array
    {
        $rules = [];
        foreach (GamificationController::xpRules() as $key => $rule) {
            $rules[$key] = (int) Setting::getValue($key, $rule['value']);
        }

        return $rules;
    }

    /**
     * The raw activity metrics a user's badges and XP are computed from.
     * $since limits lesson/quiz/assignment counts to that window; course
     * completions are always all-time (a course stays completed).
     */
    public function metrics(User $user, ?Carbon $since = null): array
    {
        $lessons = LessonProgress::query()
            ->where('is_completed', true)
            ->whereHas('enrollment', fn ($q) => $q->where('student_id', $user->id))
            ->when($since, fn ($q) => $q->where('completed_at', '>=', $since))
            ->count();

        $quizzes = QuizAttempt::query()
            ->where('student_id', $user->id)
            ->where('status', 'passed')
            ->when($since, fn ($q) => $q->where('completed_at', '>=', $since))
            ->count();

        $assignments = Submission::query()
            ->where('student_id', $user->id)
            ->whereIn('status', ['submitted', 'graded'])
            ->when($since, fn ($q) => $q->where('submitted_at', '>=', $since))
            ->count();

        $courses = Enrollment::query()
            ->where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $rules = $this->xpRules();

        return [
            'lessons_completed' => $lessons,
            'quizzes_passed' => $quizzes,
            'assignments_submitted' => $assignments,
            'courses_completed' => $courses,
            'xp' => $lessons * $rules['xp_lesson_complete']
                + $quizzes * $rules['xp_quiz_pass']
                + $assignments * $rules['xp_assignment_submit'],
        ];
    }

    public function totalXp(User $user): int
    {
        return $this->metrics($user)['xp'];
    }

    /**
     * Award every active badge whose rule the user now satisfies.
     * Returns the newly awarded badges.
     */
    public function evaluate(User $user): array
    {
        Badge::ensureSeeded();

        $metrics = $this->metrics($user);
        $metrics[Badge::RULE_XP_THRESHOLD] = $metrics['xp'];

        $awardedIds = BadgeAward::query()
            ->where('user_id', $user->id)
            ->pluck('badge_id')
            ->all();

        $newly = [];
        foreach (Badge::query()->where('is_active', true)->get() as $badge) {
            if (in_array($badge->id, $awardedIds, true)) {
                continue;
            }
            $current = $metrics[$badge->rule_type] ?? 0;
            if ($current >= $badge->threshold) {
                BadgeAward::create([
                    'user_id' => $user->id,
                    'badge_id' => $badge->id,
                    'awarded_at' => now(),
                ]);
                $newly[] = $badge;
            }
        }

        return $newly;
    }

    /**
     * Current progress (0..threshold) towards a badge for a user.
     */
    public function progressFor(User $user, Badge $badge, ?array $metrics = null): int
    {
        $metrics ??= $this->metrics($user);
        $metrics[Badge::RULE_XP_THRESHOLD] = $metrics['xp'];

        return min($metrics[$badge->rule_type] ?? 0, $badge->threshold);
    }

    /**
     * Recent XP-earning events, newest first, for the achievements page.
     */
    public function xpHistory(User $user, int $limit = 6): array
    {
        $rules = $this->xpRules();
        $events = collect();

        $lessons = LessonProgress::query()
            ->with('lesson:id,title')
            ->where('is_completed', true)
            ->whereHas('enrollment', fn ($q) => $q->where('student_id', $user->id))
            ->orderByDesc('completed_at')
            ->limit($limit)
            ->get();
        foreach ($lessons as $row) {
            $events->push([
                'label' => 'သင်ခန်းစာ ပြီးဆုံး — '.($row->lesson?->title ?? 'သင်ခန်းစာ'),
                'xp' => $rules['xp_lesson_complete'],
                'at' => $row->completed_at ?? $row->updated_at,
            ]);
        }

        $quizzes = QuizAttempt::query()
            ->with('quiz:id,title')
            ->where('student_id', $user->id)
            ->where('status', 'passed')
            ->orderByDesc('completed_at')
            ->limit($limit)
            ->get();
        foreach ($quizzes as $attempt) {
            $events->push([
                'label' => 'Quiz အောင်မြင် — '.($attempt->quiz?->title ?? 'Quiz'),
                'xp' => $rules['xp_quiz_pass'],
                'at' => $attempt->completed_at ?? $attempt->updated_at,
            ]);
        }

        $submissions = Submission::query()
            ->with('assignment:id,title')
            ->where('student_id', $user->id)
            ->whereIn('status', ['submitted', 'graded'])
            ->orderByDesc('submitted_at')
            ->limit($limit)
            ->get();
        foreach ($submissions as $submission) {
            $events->push([
                'label' => 'Assignment တင်သွင်းပြီး — '.($submission->assignment?->title ?? 'Assignment'),
                'xp' => $rules['xp_assignment_submit'],
                'at' => $submission->submitted_at ?? $submission->updated_at,
            ]);
        }

        return $events
            ->sortByDesc(fn ($e) => $e['at'] ? Carbon::parse($e['at'])->timestamp : 0)
            ->take($limit)
            ->map(fn ($e) => [
                'label' => $e['label'],
                'xp' => $e['xp'],
                'when' => $e['at'] ? $this->relativeDay(Carbon::parse($e['at'])) : '',
            ])
            ->values()
            ->all();
    }

    /**
     * Consecutive days (ending today or yesterday) with at least one
     * completed lesson.
     */
    public function streak(User $user): int
    {
        $days = LessonProgress::query()
            ->where('is_completed', true)
            ->whereHas('enrollment', fn ($q) => $q->where('student_id', $user->id))
            ->whereNotNull('completed_at')
            ->pluck('completed_at')
            ->map(fn ($at) => Carbon::parse($at)->toDateString())
            ->unique()
            ->flip()
            ->all();

        $streak = 0;
        $day = Carbon::today();
        if (! isset($days[$day->toDateString()])) {
            $day = $day->copy()->subDay();
        }
        while (isset($days[$day->toDateString()])) {
            $streak++;
            $day = $day->copy()->subDay();
        }

        return $streak;
    }

    /**
     * Leaderboard entries for the window starting at $since, top $limit
     * plus the current user (with their true rank) when they have XP but
     * fall outside the top $limit.
     */
    public function leaderboard(Carbon $since, ?int $currentUserId = null, int $limit = 10): array
    {
        $rules = $this->xpRules();
        $xpByStudent = [];
        $lessonsByStudent = [];

        $lessonRows = LessonProgress::query()
            ->join('enrollments', 'lesson_progress.enrollment_id', '=', 'enrollments.id')
            ->where('lesson_progress.is_completed', true)
            ->where('lesson_progress.completed_at', '>=', $since)
            ->selectRaw('enrollments.student_id, count(*) as c')
            ->groupBy('enrollments.student_id')
            ->pluck('c', 'student_id');
        foreach ($lessonRows as $studentId => $count) {
            $xpByStudent[$studentId] = ($xpByStudent[$studentId] ?? 0) + $count * $rules['xp_lesson_complete'];
            $lessonsByStudent[$studentId] = $count;
        }

        $quizRows = QuizAttempt::query()
            ->where('status', 'passed')
            ->where('completed_at', '>=', $since)
            ->selectRaw('student_id, count(*) as c')
            ->groupBy('student_id')
            ->pluck('c', 'student_id');
        foreach ($quizRows as $studentId => $count) {
            $xpByStudent[$studentId] = ($xpByStudent[$studentId] ?? 0) + $count * $rules['xp_quiz_pass'];
        }

        $submissionRows = Submission::query()
            ->whereIn('status', ['submitted', 'graded'])
            ->where('submitted_at', '>=', $since)
            ->selectRaw('student_id, count(*) as c')
            ->groupBy('student_id')
            ->pluck('c', 'student_id');
        foreach ($submissionRows as $studentId => $count) {
            $xpByStudent[$studentId] = ($xpByStudent[$studentId] ?? 0) + $count * $rules['xp_assignment_submit'];
        }

        arsort($xpByStudent);
        $rankedIds = array_keys($xpByStudent);
        $users = User::query()->whereIn('id', $rankedIds)->get(['id', 'name'])->keyBy('id');

        $entries = [];
        $rank = 0;
        foreach ($xpByStudent as $studentId => $xp) {
            $rank++;
            if ($rank > $limit && $studentId !== $currentUserId) {
                continue;
            }
            $user = $users->get($studentId);
            if (! $user) {
                continue;
            }
            $entries[] = $this->leaderboardEntry($user, $rank, (int) $xp, (int) ($lessonsByStudent[$studentId] ?? 0), $studentId === $currentUserId);
        }

        return $entries;
    }

    public static function initials(string $name): string
    {
        $initials = collect(explode(' ', trim($name)))
            ->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))
            ->take(2)
            ->implode('');

        return $initials ?: '?';
    }

    public static function colorFor(int $id): string
    {
        return self::COLORS[$id % count(self::COLORS)];
    }

    private function leaderboardEntry(User $user, int $rank, int $xp, int $lessonsDone, bool $isMe): array
    {
        return [
            'rank' => $rank,
            'n' => $user->name,
            'xp' => $xp,
            'streak' => $this->streak($user),
            'done' => $lessonsDone,
            'init' => self::initials($user->name),
            'col' => self::colorFor($user->id),
            'ch' => 0,
            'you' => $isMe,
        ];
    }

    private function relativeDay(Carbon $date): string
    {
        if ($date->isToday()) {
            return 'ယနေ့';
        }
        if ($date->isYesterday()) {
            return 'မနေ့က';
        }

        return $date->toDateString();
    }
}
