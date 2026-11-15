<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\StudentNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $enrollments = Enrollment::query()
            ->with(['course.category', 'course.modules.lessons'])
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
        ]);
    }
}
