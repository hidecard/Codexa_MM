<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseModule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function index(): Response
    {
        $modules = CourseModule::query()
            ->with(['course:id,title'])
            ->withCount('lessons')
            ->orderBy('course_id')
            ->orderBy('position')
            ->get()
            ->map(fn (CourseModule $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'course' => $m->course?->title ?? '—',
                'position' => $m->position,
                'lessons_count' => $m->lessons_count,
                'description' => $m->description,
            ])->values();

        return Inertia::render('Admin/Academy/Modules/Index', [
            'modules' => $modules,
        ]);
    }

    // Curriculum builder page: pick a course, see its modules + lessons.
    public function curriculum(Request $request): Response
    {
        $courses = Course::query()->orderBy('title')->get(['id', 'title']);
        $courseId = (int) $request->integer('course', $courses->first()?->id ?? 0);
        $course = $courses->firstWhere('id', $courseId) ?? $courses->first();
        $courseId = $course?->id ?? 0;

        $modules = $courseId
            ? CourseModule::query()
                ->where('course_id', $courseId)
                ->with(['lessons:id,module_id,title,type,duration,video_url,position'])
                ->orderBy('position')
                ->get()
                ->map(fn (CourseModule $m) => [
                    'id' => $m->id,
                    'title' => $m->title,
                    'description' => $m->description,
                    'position' => $m->position,
                    'lessons' => $m->lessons->map(fn ($l) => [
                        'id' => $l->id,
                        'title' => $l->title,
                        'type' => $l->type,
                        'duration' => $l->duration,
                        // video_url is hidden on the model; the admin builder
                        // needs it to show the YouTube link.
                        'video' => $l->video_url,
                    ])->values(),
                ])->values()
            : collect();

        return Inertia::render('Admin/Academy/Curriculum/Index', [
            'courses' => $courses,
            'courseId' => $courseId,
            'modules' => $modules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:1'],
        ]);
        $validated['position'] = $validated['position'] ?? ((CourseModule::query()->where('course_id', $validated['course_id'])->max('position') ?? 0) + 1);
        CourseModule::query()->create($validated);

        return back()->with('success', 'Module added.');
    }

    public function update(Request $request, CourseModule $module): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'integer', 'min:1'],
        ]);
        $module->update($validated);

        return back()->with('success', 'Module updated.');
    }

    public function destroy(CourseModule $module): RedirectResponse
    {
        $module->delete();

        return back()->with('success', 'Module removed.');
    }
}
