<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class PublicAboutController extends Controller
{
    public function __invoke(): Response
    {
        // The role() scope throws when the role does not exist yet (fresh,
        // unseeded database), so only query instructors when the role exists.
        $hasInstructorRole = Role::query()->where('name', 'instructor')->where('guard_name', 'web')->exists();

        $instructors = $hasInstructorRole
            ? User::query()->role('instructor')->with('profile')->orderBy('name')->take(4)->get()
            : collect();

        $instructors->each(function (User $instructor) {
            $instructor->setAttribute(
                'courses_count',
                Course::query()
                    ->published()
                    ->where(fn ($q) => $q->where('instructor_id', $instructor->id)->orWhereHas('instructors', fn ($qq) => $qq->whereKey($instructor->id)))
                    ->count(),
            );
        });

        return Inertia::render('Public/About', [
            'instructors' => $instructors,
            'stats' => [
                'courses' => Course::query()->published()->count(),
                'students' => Enrollment::query()->distinct('student_id')->count('student_id'),
                'instructors' => $hasInstructorRole ? User::query()->role('instructor')->count() : 0,
                'rating' => round((float) CourseReview::query()->where('is_approved', true)->avg('rating'), 1) ?: null,
            ],
        ]);
    }
}