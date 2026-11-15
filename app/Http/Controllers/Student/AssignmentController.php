<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Enrollment;
use App\Models\Submission;
use App\Services\CertificateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courseIds = Enrollment::query()
            ->where('student_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->pluck('course_id');

        $assignments = Assignment::query()
            ->with(['course:id,title'])
            ->whereIn('course_id', $courseIds)
            ->with(['submissions' => fn ($q) => $q->where('student_id', $user->id)->with('grade:id,submission_id,score,feedback,graded_at')])
            ->latest('due_at')
            ->get()
            ->map(fn (Assignment $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'due_at' => optional($a->due_at)?->toDateTimeString(),
                'max_score' => $a->max_score,
                'course' => $a->course ? ['id' => $a->course->id, 'title' => $a->course->title] : null,
                'submission' => $a->submissions->first() ? [
                    'id' => $a->submissions->first()->id,
                    'status' => $a->submissions->first()->status,
                    'submitted_at' => optional($a->submissions->first()->submitted_at)?->toDateTimeString(),
                    'grade' => $a->submissions->first()->grade ? [
                        'score' => (float) $a->submissions->first()->grade->score,
                        'feedback' => $a->submissions->first()->grade->feedback,
                    ] : null,
                ] : null,
            ])->values();

        return Inertia::render('Student/Assignments/Index', ['assignments' => $assignments]);
    }

    public function show(Request $request, Assignment $assignment): Response
    {
        $this->authorize('view', $assignment);
        $assignment->load(['course:id,title', 'attachments:id,assignment_id,original_name,file_type,file_size']);
        $submission = Submission::query()
            ->with(['files:id,submission_id,original_name,file_type,file_size', 'grade:id,submission_id,score,feedback,graded_at'])
            ->where('assignment_id', $assignment->id)
            ->where('student_id', $request->user()->id)
            ->first();

        return Inertia::render('Student/Assignments/Show', [
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'instructions' => $assignment->instructions,
                'max_score' => $assignment->max_score,
                'due_at' => optional($assignment->due_at)?->toDateTimeString(),
                'allow_late_submission' => (bool) $assignment->allow_late_submission,
                'course' => $assignment->course ? ['id' => $assignment->course->id, 'title' => $assignment->course->title] : null,
                'attachments' => $assignment->attachments->map(fn ($a) => ['id' => $a->id, 'name' => $a->original_name, 'type' => $a->file_type, 'size' => $a->file_size])->values(),
            ],
            'submission' => $submission ? [
                'id' => $submission->id,
                'content' => $submission->content,
                'status' => $submission->status,
                'submitted_at' => optional($submission->submitted_at)?->toDateTimeString(),
                'grade' => $submission->grade ? ['score' => (float) $submission->grade->score, 'feedback' => $submission->grade->feedback, 'graded_at' => optional($submission->grade->graded_at)?->toDateTimeString()] : null,
            ] : null,
        ]);
    }

    public function submit(Request $request, Assignment $assignment): RedirectResponse
    {
        $this->authorize('view', $assignment);
        $validated = $request->validate(['content' => ['nullable', 'string', 'max:10000']]);

        $submission = Submission::query()->firstOrNew([
            'assignment_id' => $assignment->id,
            'student_id' => $request->user()->id,
        ]);

        if ($submission->exists && in_array($submission->status, ['graded'], true)) {
            throw ValidationException::withMessages(['submission' => 'A graded submission cannot be modified.']);
        }

        $isLate = $assignment->due_at && now()->greaterThan($assignment->due_at);
        if ($isLate && ! $assignment->allow_late_submission) {
            throw ValidationException::withMessages(['submission' => 'Late submissions are not allowed for this assignment.']);
        }

        $submission->fill([
            'content' => $validated['content'] ?? $submission->content,
            'status' => 'submitted',
            'submitted_at' => now(),
        ])->save();

        $enrollment = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $assignment->course_id)
            ->first();
        if ($enrollment) {
            app(CertificateService::class)->recalculateEnrollmentCompletion($enrollment);
        }

        return back()->with('success', $isLate ? 'Late submission received.' : 'Assignment submitted.');
    }
}
