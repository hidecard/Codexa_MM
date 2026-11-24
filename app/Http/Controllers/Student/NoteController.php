<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\StudentNote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $notes = StudentNote::query()
            ->with(['course:id,title', 'lesson:id,title'])
            ->where('student_id', $user->id)
            ->latest()
            ->get()
            ->map(fn (StudentNote $n) => [
                'id' => $n->id,
                'courseId' => $n->course_id,
                'course' => $n->course?->title,
                'lessonId' => $n->lesson_id,
                'lesson' => $n->title ?? $n->lesson?->title ?? 'မှတ်စု',
                'body' => $n->content,
                'date' => optional($n->created_at)?->toDateString(),
            ])->values();

        $courses = Enrollment::query()
            ->with('course:id,title')
            ->where('student_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->get()
            ->map(fn (Enrollment $e) => $e->course)
            ->filter()
            ->unique('id')
            ->map(fn ($c) => ['id' => $c->id, 'title' => $c->title])
            ->values();

        return Inertia::render('Student/Notes/Index', [
            'notes' => $notes,
            'courses' => $courses,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        StudentNote::create([
            'student_id' => $request->user()->id,
            'course_id' => $validated['course_id'] ?? null,
            'lesson_id' => $validated['lesson_id'] ?? null,
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'မှတ်စု သိမ်းပြီးပါပြီ');
    }

    public function update(Request $request, StudentNote $note): RedirectResponse
    {
        abort_unless($note->student_id === $request->user()->id, 403);

        $validated = $request->validate([
            'course_id' => ['nullable', 'integer', 'exists:courses,id'],
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ]);

        $note->update([
            'course_id' => $validated['course_id'] ?? null,
            'lesson_id' => $validated['lesson_id'] ?? null,
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'မှတ်စု ပြင်ဆင်ပြီးပါပြီ');
    }

    public function destroy(Request $request, StudentNote $note): RedirectResponse
    {
        abort_unless($note->student_id === $request->user()->id, 403);

        $note->delete();

        return back()->with('success', 'မှတ်စု ဖျက်ပြီးပါပြီ');
    }
}
