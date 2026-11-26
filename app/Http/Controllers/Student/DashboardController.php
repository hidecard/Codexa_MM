<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\StudentNotification;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $enrollments = Enrollment::query()
            ->with(['course.category', 'course.instructor:id,name', 'course.modules.lessons'])
            ->where('student_id', $user->id)
            ->latest('enrolled_at')
            ->get();

        $enrollmentIds = $enrollments->pluck('id');
        $courseIds = $enrollments->pluck('course_id');

        $completedLessonCounts = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollmentIds)
            ->where('is_completed', true)
            ->selectRaw('enrollment_id, count(*) as aggregate')
            ->groupBy('enrollment_id')
            ->pluck('aggregate', 'enrollment_id');

        $lastProgress = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollmentIds)
            ->with('lesson')
            ->latest('updated_at')
            ->get()
            ->keyBy('enrollment_id');

        $cards = $enrollments->map(function (Enrollment $enrollment) use ($completedLessonCounts, $lastProgress) {
            $totalLessons = $enrollment->course->modules->sum(fn ($m) => $m->lessons->count());
            $completed = (int) ($completedLessonCounts[$enrollment->id] ?? 0);
            $progress = $totalLessons > 0 ? (int) round(($completed / $totalLessons) * 100) : 0;
            $continueLesson = optional($lastProgress->get($enrollment->id))->lesson;
            if (! $continueLesson) {
                $continueLesson = $enrollment->course->modules->flatMap->lessons->sortBy('position')->first();
            }

            return [
                'id' => $enrollment->id,
                'status' => $enrollment->status,
                'progress' => $progress,
                'completed_lessons' => $completed,
                'total_lessons' => $totalLessons,
                'course' => [
                    'id' => $enrollment->course->id,
                    'title' => $enrollment->course->title,
                    'slug' => $enrollment->course->slug,
                    'category' => $enrollment->course->category?->name,
                    'instructor' => $enrollment->course->instructor?->name,
                    'thumbnail' => $enrollment->course->thumbnail,
                ],
                'continue_lesson' => $continueLesson ? [
                    'id' => $continueLesson->id,
                    'title' => $continueLesson->title,
                ] : null,
            ];
        })->values();

        $assignments = Assignment::query()
            ->with('course:id,title')
            ->whereIn('course_id', $courseIds)
            ->orderByRaw('due_at is null, due_at asc')
            ->limit(8)
            ->get()
            ->map(fn (Assignment $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'due_at' => optional($a->due_at)?->toDateTimeString(),
                'course' => $a->course ? ['id' => $a->course->id, 'title' => $a->course->title] : null,
            ])->values();

        $activities = LessonProgress::query()
            ->with(['lesson:id,title', 'enrollment.course:id,title'])
            ->whereIn('enrollment_id', $enrollmentIds)
            ->latest('updated_at')
            ->limit(8)
            ->get()
            ->map(fn (LessonProgress $p) => [
                'id' => $p->id,
                'lesson' => $p->lesson?->title,
                'course' => $p->enrollment?->course?->title,
                'is_completed' => (bool) $p->is_completed,
                'updated_at' => optional($p->updated_at)?->toDateTimeString(),
            ])->values();

        $certificates = Certificate::query()
            ->with('enrollment.course:id,title')
            ->whereIn('enrollment_id', $enrollmentIds)
            ->latest('issued_at')
            ->get()
            ->map(fn (Certificate $c) => [
                'id' => $c->id,
                'certificate_number' => $c->certificate_number,
                'issued_at' => optional($c->issued_at)?->toDateString(),
                'course' => $c->enrollment?->course?->title,
            ])->values();

        $notifications = StudentNotification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(8)
            ->get(['id', 'title', 'message', 'is_read', 'created_at'])
            ->map(fn (StudentNotification $n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'is_read' => (bool) $n->is_read,
                'created_at' => optional($n->created_at)?->toDateTimeString(),
            ])->values();

        // Leaderboard (weekly XP)
        $leaderboard = collect(app(BadgeService::class)->leaderboard(now()->subDays(7), $user->id))
            ->map(function (array $entry, $index) use ($user) {
                return [
                    'rank' => $index + 1,
                    'name' => $entry['n'] ?? '',
                    'xp' => $entry['xp'] ?? 0,
                    'you' => $entry['you'] ?? false,
                ];
            })->values();

        // Weekly study activity (last 7 days) from lesson watch time.
        $dayNames = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
        $weeklySeconds = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollmentIds)
            ->where('updated_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(updated_at) as day, SUM(watch_time) as seconds')
            ->groupBy('day')
            ->pluck('seconds', 'day');
        $weeklyActivity = collect(range(6, 0))->map(function ($ago) use ($weeklySeconds, $dayNames) {
            $date = now()->subDays($ago);
            $seconds = (int) ($weeklySeconds[$date->toDateString()] ?? 0);

            return [
                'day' => $dayNames[$date->dayOfWeek],
                'minutes' => (int) round($seconds / 60),
            ];
        })->values();
        $totalWatchMinutes = (int) round(
            LessonProgress::query()->whereIn('enrollment_id', $enrollmentIds)->sum('watch_time') / 60
        );

        return Inertia::render('Student/Dashboard', [
            'enrollments' => $cards,
            'stats' => [
                'enrolled' => $enrollments->count(),
                'active' => $enrollments->where('status', 'active')->count(),
                'completed' => $enrollments->where('status', 'completed')->count(),
            ],
            'assignments' => $assignments,
            'activities' => $activities,
            'certificates' => $certificates,
            'notifications' => $notifications,
            'weeklyActivity' => $weeklyActivity,
            'totalWatchMinutes' => $totalWatchMinutes,
            'leaderboard' => $leaderboard,
        ]);
    }
}
