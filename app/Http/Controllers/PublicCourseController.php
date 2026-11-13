<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicCourseController extends Controller
{
    public function index(Request $request): Response
    {
        $courses = Course::query()
            ->published()
            ->with(['category', 'instructor'])
            ->when($request->string('q')->trim()->value(), function ($query, string $search) {
                $query->where(function ($course) use ($search) {
                    $course->where('title', 'like', "%{$search}%")
                        ->orWhere('short_description', 'like', "%{$search}%");
                });
            })
            ->when($request->integer('category'), fn ($query, int $category) => $query->where('category_id', $category))
            ->latest('published_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Public/Courses/Index', [
            'courses' => $courses,
            'categories' => CourseCategory::query()->where('is_active', true)->orderBy('position')->get(['id', 'name', 'slug']),
            'filters' => [
                'q' => $request->string('q')->trim()->value(),
                'category' => $request->integer('category') ?: null,
            ],
        ]);
    }

    public function show(Course $course): Response
    {
        abort_unless($course->status === 'published' && $course->published_at && $course->category?->is_active, 404);

        $course->load(['category', 'instructor', 'modules']);

        return Inertia::render('Public/Courses/Show', [
            'course' => $course,
        ]);
    }
}
