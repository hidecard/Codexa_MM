<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyCoursesController extends Controller
{
    public function index(Request $request): Response
    {
        $enrollments = Enrollment::query()
            ->with(['course.category', 'course.instructor:id,name', 'course.modules.lessons'])
            ->where('student_id', $request->user()->id)
            ->latest('enrolled_at')
            ->get();

        $enrollmentIds = $enrollments->pluck('id');

        $completedLessonCounts = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollmentIds)
            ->where('is_completed', true)
            ->selectRaw('enrollment_id, count(*) as aggregate')
            ->groupBy('enrollment_id')
            ->pluck('aggregate', 'enrollment_id');

        $courses = $enrollments->map(function (Enrollment $enrollment) use ($completedLessonCounts) {
            $totalLessons = $enrollment->course->modules->sum(fn ($m) => $m->lessons->count());
            $completed = (int) ($completedLessonCounts[$enrollment->id] ?? 0);
            $progress = $totalLessons > 0 ? (int) round(($completed / $totalLessons) * 100) : 0;

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
            ];
        })->values();

        return Inertia::render('Student/MyCourses', [
            'enrollments' => $courses,
        ]);
    }
}
