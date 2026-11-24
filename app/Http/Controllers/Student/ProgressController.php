<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\QuizAttempt;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgressController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $enrollments = Enrollment::query()
            ->with(['course.modules.lessons:id,module_id'])
            ->where('student_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
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

        $courses = $enrollments->map(function (Enrollment $enrollment) use ($completedLessonCounts) {
            $totalLessons = $enrollment->course->modules->sum(fn ($m) => $m->lessons->count());
            $completed = (int) ($completedLessonCounts[$enrollment->id] ?? 0);

            return [
                'id' => $enrollment->course->id,
                'title' => $enrollment->course->title,
                'progress' => $totalLessons > 0 ? (int) round(($completed / $totalLessons) * 100) : 0,
                'completed' => $completed,
                'total' => $totalLessons,
            ];
        })->values();

        $dayNames = ['တနင်္ဂနွေ', 'တနင်္လာ', 'အင်္ဂါ', 'ဗုဒ္ဓဟူး', 'ကြာသပတေး', 'သောကြာ', 'စနေ'];
        $weeklySeconds = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollmentIds)
            ->where('updated_at', '>=', now()->subDays(6)->startOfDay())
            ->selectRaw('DATE(updated_at) as day, SUM(watch_time) as seconds')
            ->groupBy('day')
            ->pluck('seconds', 'day');
        $weeklyActivity = collect(range(6, 0))->map(function ($ago) use ($weeklySeconds, $dayNames) {
            $date = now()->subDays($ago);

            return [
                'day' => $dayNames[$date->dayOfWeek],
                'minutes' => (int) round(((int) ($weeklySeconds[$date->toDateString()] ?? 0)) / 60),
            ];
        })->values();

        $totalWatchMinutes = (int) round(
            LessonProgress::query()->whereIn('enrollment_id', $enrollmentIds)->sum('watch_time') / 60
        );

        $quizAverage = (int) round((float) QuizAttempt::query()
            ->where('student_id', $user->id)
            ->where('status', 'completed')
            ->avg('score'));

        $assignmentIds = Assignment::query()->whereIn('course_id', $courseIds)->pluck('id');
        $assignmentTotal = $assignmentIds->count();
        $assignmentDone = Submission::query()
            ->where('student_id', $user->id)
            ->whereIn('assignment_id', $assignmentIds)
            ->distinct('assignment_id')
            ->count('assignment_id');

        return Inertia::render('Student/Progress/Index', [
            'weeklyActivity' => $weeklyActivity,
            'totalWatchMinutes' => $totalWatchMinutes,
            'courses' => $courses,
            'quizAverage' => $quizAverage,
            'assignmentDone' => $assignmentDone,
            'assignmentTotal' => $assignmentTotal,
        ]);
    }
}
