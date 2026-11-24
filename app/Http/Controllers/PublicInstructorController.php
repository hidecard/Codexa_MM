<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicInstructorController extends Controller
{
    public function index(Request $request): Response
    {
        $instructors = User::query()
            ->role('instructor')
            ->with('profile')
            ->when($request->string('q')->trim()->value(), fn ($query, string $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        $instructors->getCollection()->transform(function (User $instructor) {
            $instructor->setAttribute(
                'courses_count',
                Course::query()
                    ->published()
                    ->where(fn ($q) => $q->where('instructor_id', $instructor->id)->orWhereHas('instructors', fn ($qq) => $qq->whereKey($instructor->id)))
                    ->count(),
            );

            return $instructor;
        });

        return Inertia::render('Public/Instructors/Index', [
            'instructors' => $instructors,
            'filters' => ['q' => $request->string('q')->trim()->value()],
        ]);
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

        $reviews = \App\Models\CourseReview::query()
            ->where('is_approved', true)
            ->whereIn('course_id', $courses->pluck('id'))
            ->with(['student:id,name', 'course:id,title,slug'])
            ->latest()
            ->take(6)
            ->get(['id', 'course_id', 'student_id', 'rating', 'comment']);

        return Inertia::render('Public/Instructors/Show', [
            'instructor' => $instructor,
            'courses' => $courses,
            'reviews' => $reviews,
        ]);
    }
}
