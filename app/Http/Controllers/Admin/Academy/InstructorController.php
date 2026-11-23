<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InstructorController extends Controller
{
    private const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    public function index(): Response
    {
        $instructors = User::query()
            ->role('instructor')
            ->with(['taughtCourses:id,instructor_id,price'])
            ->withCount('taughtCourses')
            ->latest()
            ->get();

        $courseIds = $instructors->flatMap(fn (User $u) => $u->taughtCourses->pluck('id'))->unique()->values();
        $enrollmentCounts = $courseIds->isEmpty()
            ? collect()
            : Enrollment::query()->whereIn('course_id', $courseIds)->selectRaw('course_id, count(*) as c')->groupBy('course_id')->pluck('c', 'course_id');
        $ratings = $courseIds->isEmpty()
            ? collect()
            : CourseReview::query()->whereIn('course_id', $courseIds)->selectRaw('course_id, avg(rating) as r')->groupBy('course_id')->pluck('r', 'course_id');

        $rows = $instructors->map(function (User $u) use ($enrollmentCounts, $ratings) {
            $students = 0;
            $revenue = 0.0;
            $ratingSum = 0.0;
            $ratingN = 0;
            foreach ($u->taughtCourses as $course) {
                $n = (int) ($enrollmentCounts[$course->id] ?? 0);
                $students += $n;
                $revenue += (float) $course->price * $n;
                if (isset($ratings[$course->id])) {
                    $ratingSum += (float) $ratings[$course->id];
                    $ratingN++;
                }
            }
            $initials = collect(explode(' ', trim($u->name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

            return [
                'name' => $u->name,
                'init' => $initials ?: '?',
                'col' => self::COLORS[$u->id % count(self::COLORS)],
                'field' => 'Instructor',
                'courses' => $u->taught_courses_count,
                'students' => $students,
                'rating' => $ratingN ? round($ratingSum / $ratingN, 1) : 0,
                'share' => (int) round($revenue * 0.5),
                'payout' => 'pending', // No payout model yet.
            ];
        })->values();

        return Inertia::render('Admin/Academy/Instructors/Index', [
            'instructors' => $rows,
            'applications' => [], // No instructor application model yet.
        ]);
    }
}
