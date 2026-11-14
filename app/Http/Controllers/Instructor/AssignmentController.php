<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Course;
use App\Models\Grade;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courses = Course::query()
            ->where(fn ($q) => $q->where('instructor_id', $user->id)->orWhereHas('instructors', fn ($qq) => $qq->whereKey($user->id)))
            ->pluck('id');

        $assignments = Assignment::query()
            ->with(['course:id,title'])
            ->withCount('submissions')
            ->whereIn('course_id', $courses)
            ->latest()
            ->get()
            ->map(fn (Assignment $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'due_at' => optional($a->due_at)?->toDateTimeString(),
                'max_score' => $a->max_score,
                'submissions_count' => $a->submissions_count,
                'course' => $a->course ? ['id' => $a->course->id, 'title' => $a->course->title] : null,
            ])->values();

        $courseOptions = Course::query()->whereIn('id', $courses)->get(['id', 'title']);

        return Inertia::render('Instructor/Assignments/Index', [
            'assignments' => $assignments,
            'courses' => $courseOptions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'instructions' => ['required', 'string'],
            'max_score' => ['required', 'integer', 'min:1', 'max:1000'],
            'due_at' => ['nullable', 'date'],
            'allow_late_submission' => ['boolean'],
        ]);
        $course = Course::findOrFail($validated['course_id']);
        $this->authorize('update', $course);

        Assignment::create([
            'course_id' => $course->id,
            'title' => $validated['title'],
            'instructions' => $validated['instructions'],
            'max_score' => $validated['max_score'],
            'due_at' => $validated['due_at'] ?? null,
            'allow_late_submission' => (bool) ($validated['allow_late_submission'] ?? false),
        ]);

        return back()->with('success', 'Assignment created.');
    }

    public function show(Request $request, Assignment $assignment): Response
    {
        $this->authorize('update', $assignment);
        $assignment->load([
            'course:id,title',
            'submissions.student:id,name,email',
            'submissions.grade:id,submission_id,score,feedback,graded_at',
        ]);

        return Inertia::render('Instructor/Assignments/Show', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'instructions' => $assignment->instructions,
                'max_score' => $assignment->max_score,
                'due_at' => optional($assignment->due_at)?->toDateTimeString(),
                'allow_late_submission' => (bool) $assignment->allow_late_submission,
                'course' => $assignment->course ? ['id' => $assignment->course->id, 'title' => $assignment->course->title] : null,
            ],
            'submissions' => $assignment->submissions->map(fn (Submission $s) => [
                'id' => $s->id,
                'status' => $s->status,
                'content' => $s->content,
                'submitted_at' => optional($s->submitted_at)?->toDateTimeString(),
                'student' => $s->student ? ['id' => $s->student->id, 'name' => $s->student->name, 'email' => $s->student->email] : null,
                'grade' => $s->grade ? ['score' => (float) $s->grade->score, 'feedback' => $s->grade->feedback] : null,
            ])->values(),
        ]);
    }

    public function grade(Request $request, Assignment $assignment, Submission $submission): RedirectResponse
    {
        $this->authorize('grade', $submission);
        abort_unless($submission->assignment_id === $assignment->id, 404);
        $validated = $request->validate([
            'score' => ['required', 'numeric', 'min:0', 'max:'.$assignment->max_score],
            'feedback' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', 'in:graded,returned'],
        ]);

        Grade::query()->updateOrCreate(
            ['submission_id' => $submission->id],
            [
                'instructor_id' => $request->user()->id,
                'score' => $validated['score'],
                'feedback' => $validated['feedback'] ?? null,
                'graded_at' => now(),
            ]
        );
        $submission->forceFill(['status' => $validated['status'] ?? 'graded'])->save();

        $enrollment = \App\Models\Enrollment::query()
            ->where('student_id', $submission->student_id)
            ->where('course_id', $assignment->course_id)
            ->first();
        if ($enrollment) {
            app(\App\Services\CertificateService::class)->recalculateEnrollmentCompletion($enrollment);
        }

        return back()->with('success', 'Submission graded.');

        return back()->with('success', 'Submission graded.');
    }
}
