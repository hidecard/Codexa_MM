<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicCourseController extends Controller
{
    public function index(Request $request): Response
    {
        // `category` accepts either a category id or a slug (footer / landing
        // links use slugs like ?category=web-development).
        $categoryParam = $request->string('category')->trim()->value();
        $categoryId = null;
        if ($categoryParam !== '') {
            $categoryId = is_numeric($categoryParam)
                ? (int) $categoryParam
                : CourseCategory::query()->where('slug', $categoryParam)->value('id');
        }

        $level = $request->string('level')->trim()->value();
        $sort = $request->string('sort')->trim()->value();
        $sort = in_array($sort, ['newest', 'priceAsc', 'priceDesc'], true) ? $sort : 'newest';

        $courses = Course::query()
            ->published()
            ->with(['category', 'instructor', 'instructors:id,name'])
            ->when($request->string('q')->trim()->value(), function ($query, string $search) {
                $query->where(function ($course) use ($search) {
                    $course->where('title', 'like', "%{$search}%")
                        ->orWhere('short_description', 'like', "%{$search}%");
                });
            })
            ->when($categoryId, fn ($query, int $category) => $query->where('category_id', $category))
            ->when(in_array($level, ['Beginner', 'Intermediate', 'Advanced'], true), fn ($query) => $query->where('level', $level))
            ->when($sort === 'priceAsc', fn ($query) => $query->orderByRaw('COALESCE(sale_price, price) asc'))
            ->when($sort === 'priceDesc', fn ($query) => $query->orderByRaw('COALESCE(sale_price, price) desc'))
            ->when($sort === 'newest', fn ($query) => $query->latest('published_at'))
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('Public/Courses/Index', [
            'courses' => $courses,
            'categories' => CourseCategory::query()->where('is_active', true)->orderBy('position')->get(['id', 'name', 'slug']),
            'filters' => [
                'q' => $request->string('q')->trim()->value(),
                'category' => $categoryId,
                'level' => $level !== '' ? $level : null,
                'sort' => $sort,
            ],
        ]);
    }

    public function categories(): Response
    {
        $categories = CourseCategory::query()
            ->where('is_active', true)
            ->withCount(['courses' => fn ($query) => $query->published()])
            ->orderBy('position')
            ->get(['id', 'name', 'slug', 'description']);

        return Inertia::render('Public/Courses/Categories', [
            'categories' => $categories,
        ]);
    }

    public function curriculum(Course $course): Response
    {
        abort_unless($course->status === 'published' && $course->published_at && $course->category?->is_active, 404);

        $course->load(['category:id,name,slug', 'instructor:id,name', 'modules.lessons']);

        return Inertia::render('Public/Courses/Curriculum', [
            'course' => $course,
        ]);
    }

    public function show(Course $course): Response
    {
        abort_unless($course->status === 'published' && $course->published_at && $course->category?->is_active, 404);

        $course->load([
            'category',
            'instructor:id,name',
            'instructors:id,name',
            'packages' => fn ($query) => $query->published()->select(['course_packages.id', 'name', 'slug', 'description', 'price', 'sale_price', 'status', 'published_at']),
            'modules.lessons',
            'announcements' => fn ($query) => $query->whereNotNull('published_at')->select(['id', 'course_id', 'title', 'content', 'published_at']),
            'reviews' => fn ($query) => $query->where('is_approved', true)->with('student:id,name')->select(['id', 'course_id', 'student_id', 'rating', 'comment']),
        ]);

        $user = request()->user();
        $enrollment = null;
        if ($user) {
            $enrollment = Enrollment::query()
                ->where('student_id', $user->id)
                ->where('course_id', $course->id)
                ->first(['id', 'status', 'course_id', 'student_id']);
        }

        return Inertia::render('Public/Courses/Show', [
            'course' => $course,
            'enrollment' => $enrollment ? ['id' => $enrollment->id, 'status' => $enrollment->status] : null,
            'canEnroll' => (bool) ($user && $user->hasRole('student')),
        ]);
    }
}
