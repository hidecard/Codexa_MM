<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CourseCategory;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = CourseCategory::query()
            ->withCount(['courses', 'courses as students_count' => function ($q) {
                $q->join('enrollments', 'enrollments.course_id', '=', 'courses.id');
            }])
            ->orderBy('position')
            ->get()
            ->map(fn (CourseCategory $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'courses' => $c->courses_count,
                'students' => (int) $c->students_count,
            ])->values();

        return Inertia::render('Admin/Academy/Categories/Index', [
            'categories' => $categories,
        ]);
    }
}
