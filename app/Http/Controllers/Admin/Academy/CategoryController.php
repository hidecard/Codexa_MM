<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CourseCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
                'description' => $c->description,
                'is_active' => (bool) $c->is_active,
                'courses' => $c->courses_count,
                'students' => (int) $c->students_count,
            ])->values();

        return Inertia::render('Admin/Academy/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);
        $validated['slug'] = $this->uniqueSlug($validated['name']);
        $validated['position'] = $validated['position'] ?? ((CourseCategory::query()->max('position') ?? 0) + 1);
        CourseCategory::query()->create($validated);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, CourseCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('course_categories', 'slug')->ignore($category->id)],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);
        $validated['is_active'] = (bool) ($validated['is_active'] ?? $category->is_active);
        $category->update($validated);

        return back()->with('success', 'Category updated.');
    }

    public function destroy(CourseCategory $category): RedirectResponse
    {
        if ($category->courses()->exists()) {
            return back()->withErrors(['category' => 'This category still has courses attached.']);
        }
        $category->delete();

        return back()->with('success', 'Category deleted.');
    }

    public function toggle(CourseCategory $category): RedirectResponse
    {
        $category->update(['is_active' => ! $category->is_active]);

        return back()->with('success', $category->is_active ? 'Category activated.' : 'Category deactivated.');
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $i = 2;
        while (CourseCategory::query()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
