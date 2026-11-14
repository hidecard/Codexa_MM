<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courses = Course::query()
            ->with('category:id,name')
            ->withCount('modules')
            ->where(fn ($q) => $q->where('instructor_id', $user->id)->orWhereHas('instructors', fn ($qq) => $qq->whereKey($user->id)))
            ->latest()
            ->get(['id', 'category_id', 'instructor_id', 'title', 'slug', 'status', 'pricing_type', 'price', 'sale_price', 'level', 'published_at', 'updated_at']);

        return Inertia::render('Instructor/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Instructor/Courses/Create', [
            'categories' => CourseCategory::query()->orderBy('position')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Course::class);
        $validated = $this->validateCourse($request);
        $validated['instructor_id'] = $request->user()->id;
        $validated['slug'] = $this->uniqueSlug($validated['slug'] ?: Str::slug($validated['title']));
        if (($validated['status'] ?? 'draft') === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $course = Course::create($validated);

        return redirect()->route('instructor.courses.edit', $course->id)->with('success', 'Course created.');
    }

    public function edit(Request $request, Course $course): Response
    {
        $this->authorize('update', $course);
        $course->load(['category:id,name', 'modules.lessons' => fn ($q) => $q->orderBy('position')]);

        return Inertia::render('Instructor/Courses/Edit', [
            'course' => $course,
            'categories' => CourseCategory::query()->orderBy('position')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);
        $validated = $this->validateCourse($request, $course->id);
        $slug = $validated['slug'] ?: Str::slug($validated['title']);
        $validated['slug'] = $this->uniqueSlug($slug, $course->id);
        if (($validated['status'] ?? $course->status) === 'published' && empty($validated['published_at']) && ! $course->published_at) {
            $validated['published_at'] = now();
        }
        $course->update($validated);

        return back()->with('success', 'Course updated.');
    }

    public function destroy(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);
        $course->delete();

        return redirect()->route('instructor.courses.index')->with('success', 'Course deleted.');
    }

    public function storeModule(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:1'],
        ]);
        $validated['position'] = $validated['position'] ?? (($course->modules()->max('position') ?? 0) + 1);
        $course->modules()->create($validated);

        return back()->with('success', 'Module added.');
    }

    public function updateModule(Request $request, Course $course, CourseModule $module): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id, 404);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:1'],
        ]);
        $module->update($validated);

        return back()->with('success', 'Module updated.');
    }

    public function destroyModule(Request $request, Course $course, CourseModule $module): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id, 404);
        $module->delete();

        return back()->with('success', 'Module removed.');
    }

    public function storeLesson(Request $request, Course $course, CourseModule $module): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id, 404);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'duration' => ['nullable', 'integer', 'min:0'],
            'position' => ['nullable', 'integer', 'min:1'],
            'type' => ['required', Rule::in(['video', 'text', 'quiz', 'assignment'])],
            'is_free' => ['boolean'],
        ]);
        $validated['duration'] = $validated['duration'] ?? 0;
        $validated['position'] = $validated['position'] ?? (($module->lessons()->max('position') ?? 0) + 1);
        $validated['is_free'] = (bool) ($validated['is_free'] ?? false);
        $module->lessons()->create($validated);

        return back()->with('success', 'Lesson added.');
    }

    public function updateLesson(Request $request, Course $course, CourseModule $module, Lesson $lesson): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id && $lesson->module_id === $module->id, 404);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'duration' => ['nullable', 'integer', 'min:0'],
            'position' => ['nullable', 'integer', 'min:1'],
            'type' => ['required', Rule::in(['video', 'text', 'quiz', 'assignment'])],
            'is_free' => ['boolean'],
        ]);
        $validated['is_free'] = (bool) ($validated['is_free'] ?? false);
        $lesson->update($validated);

        return back()->with('success', 'Lesson updated.');
    }

    public function destroyLesson(Request $request, Course $course, CourseModule $module, Lesson $lesson): RedirectResponse
    {
        $this->authorize('update', $course);
        abort_unless($module->course_id === $course->id && $lesson->module_id === $module->id, 404);
        $lesson->delete();

        return back()->with('success', 'Lesson removed.');
    }

    private function validateCourse(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'category_id' => ['required', 'integer', 'exists:course_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('courses', 'slug')->ignore($ignoreId)],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'pricing_type' => ['required', Rule::in(['free', 'paid', 'package'])],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'level' => ['required', Rule::in(['beginner', 'intermediate', 'advanced'])],
            'language' => ['nullable', 'string', 'max:10'],
            'duration' => ['nullable', 'integer', 'min:0'],
        ]);
    }

    private function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug) ?: 'course';
        $candidate = $base;
        $i = 2;
        while (Course::query()->where('slug', $candidate)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $candidate = $base.'-'.$i++;
        }
        return $candidate;
    }
}
