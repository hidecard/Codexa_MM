<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Support\AcademyAnalytics;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courseIds = AcademyAnalytics::instructorCourseIds($user->id);

        $courses = Course::query()
            ->whereIn('id', $courseIds)
            ->orderBy('title')
            ->get(['id', 'title'])
            ->map(fn (Course $course) => ['id' => $course->id, 'title' => $course->title])
            ->values();

        $enrollments = Enrollment::query()
            ->with(['student:id,name', 'course:id,title'])
            ->whereIn('course_id', $courseIds)
            ->whereIn('status', ['active', 'completed'])
            ->latest('enrolled_at')
            ->get();

        $lessonCounts = Lesson::query()
            ->join('course_modules', 'lessons.module_id', '=', 'course_modules.id')
            ->whereIn('course_modules.course_id', $courseIds)
            ->selectRaw('course_modules.course_id as course_id, COUNT(*) as total')
            ->groupBy('course_modules.course_id')
            ->pluck('total', 'course_id');

        $completedCounts = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollments->pluck('id'))
            ->where('is_completed', true)
            ->selectRaw('enrollment_id, COUNT(*) as total')
            ->groupBy('enrollment_id')
            ->pluck('total', 'enrollment_id');

        $lastActivity = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollments->pluck('id'))
            ->selectRaw('enrollment_id, MAX(updated_at) as last_at')
            ->groupBy('enrollment_id')
            ->pluck('last_at', 'enrollment_id');

        $students = $enrollments->map(function (Enrollment $enrollment) use ($lessonCounts, $completedCounts, $lastActivity) {
            $total = (int) ($lessonCounts[$enrollment->course_id] ?? 0);
            $completed = (int) ($completedCounts[$enrollment->id] ?? 0);
            $last = $lastActivity[$enrollment->id] ?? $enrollment->enrolled_at;

            return [
                'id' => $enrollment->id,
                'name' => $enrollment->student?->name ?? '—',
                'init' => $enrollment->student ? AcademyAnalytics::initials($enrollment->student->name) : '—',
                'col' => $enrollment->student ? AcademyAnalytics::avatarColor($enrollment->student->id) : '#64748b',
                'courseId' => $enrollment->course_id,
                'courseTitle' => $enrollment->course?->title ?? '—',
                'progress' => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
                'last' => $this->relativeLabel($last),
                // No XP/gamification records exist yet; 0 is honest.
                'xp' => 0,
            ];
        })->values();

        return Inertia::render('Instructor/Students/Index', [
            'students' => $students,
            'courses' => $courses,
        ]);
    }

    private function relativeLabel($date): string
    {
        if (! $date) {
            return '—';
        }
        $date = \Carbon\Carbon::parse($date);
        if ($date->isToday()) {
            return 'ယနေ့';
        }
        if ($date->isYesterday()) {
            return 'မနေ့က';
        }
        $days = $date->diffInDays(now());

        return $days < 30 ? 'လွန်ခဲ့သော '.$days.' ရက်' : $date->toDateString();
    }
}
