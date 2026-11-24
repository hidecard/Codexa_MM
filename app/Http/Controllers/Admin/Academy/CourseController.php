<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $courses = Course::query()
            ->with(['category:id,name', 'instructor:id,name'])
            ->withCount(['modules', 'lessons', 'enrollments'])
            ->withAvg('reviews', 'rating')
            ->latest()
            ->get()
            ->map(fn (Course $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'slug' => $c->slug,
                'status' => $c->status,
                'pricing_type' => $c->pricing_type,
                'price' => (float) $c->price,
                'level' => $c->level,
                'category' => $c->category?->name,
                'instructor' => $c->instructor?->name,
                'modules_count' => $c->modules_count,
                'lessons_count' => $c->lessons_count,
                'enrollments_count' => $c->enrollments_count,
                'rating' => $c->reviews_avg_rating ? round((float) $c->reviews_avg_rating, 1) : null,
            ])->values();

        return Inertia::render('Admin/Academy/Courses/Index', [
            'courses' => $courses,
        ]);
    }
}
