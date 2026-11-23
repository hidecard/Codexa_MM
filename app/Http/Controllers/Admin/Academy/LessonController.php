<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LessonController extends Controller
{
    public function index(): Response
    {
        $lessons = Lesson::query()
            ->with(['module:id,course_id,title', 'module.course:id,title'])
            ->orderBy('module_id')
            ->orderBy('position')
            ->get()
            ->map(fn (Lesson $l) => [
                'id' => $l->id,
                'title' => $l->title,
                'course' => $l->module?->course?->title ?? '—',
                'module' => $l->module?->title ?? '—',
                'type' => $l->type,
                'duration' => $l->duration,
                'is_free' => (bool) $l->is_free,
            ])->values();

        return Inertia::render('Admin/Academy/Lessons/Index', [
            'lessons' => $lessons,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'module_id' => ['required', 'integer', 'exists:course_modules,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url', 'max:2048'],
            'duration' => ['nullable', 'integer', 'min:0'],
            'position' => ['nullable', 'integer', 'min:1'],
            'type' => ['required', Rule::in(['video', 'text', 'quiz', 'assignment'])],
            'is_free' => ['boolean'],
        ]);
        $validated['duration'] = $validated['duration'] ?? 0;
        $validated['position'] = $validated['position'] ?? ((Lesson::query()->where('module_id', $validated['module_id'])->max('position') ?? 0) + 1);
        $validated['is_free'] = (bool) ($validated['is_free'] ?? false);
        Lesson::query()->create($validated);

        return back()->with('success', 'Lesson added.');
    }

    public function update(Request $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url', 'max:2048'],
            'duration' => ['nullable', 'integer', 'min:0'],
            'position' => ['nullable', 'integer', 'min:1'],
            'type' => ['required', Rule::in(['video', 'text', 'quiz', 'assignment'])],
            'is_free' => ['boolean'],
        ]);
        $validated['is_free'] = (bool) ($validated['is_free'] ?? $lesson->is_free);
        $lesson->update($validated);

        return back()->with('success', 'Lesson updated.');
    }

    public function destroy(Lesson $lesson): RedirectResponse
    {
        $lesson->delete();

        return back()->with('success', 'Lesson removed.');
    }
}
