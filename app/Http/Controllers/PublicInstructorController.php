<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class PublicInstructorController extends Controller
{
    public function index(): Response
    {
        $instructors = User::query()
            ->role('instructor')
            ->with('profile')
            ->withCount(['taughtCourses as courses_count' => fn ($q) => $q->published()])
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Public/Instructors/Index', ['instructors' => $instructors]);
    }

    public function show(User $instructor): Response
    {
        abort_unless($instructor->hasRole('instructor'), 404);

        $instructor->load('profile');
        $courses = Course::query()
            ->published()
            ->where(function ($q) use ($instructor) {
                $q->where('instructor_id', $instructor->id)
                    ->orWhereHas('instructors', fn ($qq) => $qq->whereKey($instructor->id));
            })
            ->with('category')
            ->latest('published_at')
            ->get();

        return Inertia::render('Public/Instructors/Show', [
            'instructor' => $instructor,
            'courses' => $courses,
        ]);
    }
}
