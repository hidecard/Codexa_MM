<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $submissions = Submission::query()
            ->with(['assignment.course:id,title,slug', 'grade:id,submission_id,score,feedback,graded_at', 'files:id,submission_id,original_name,file_type,file_size'])
            ->where('student_id', $user->id)
            ->latest('submitted_at')
            ->get()
            ->map(fn (Submission $s) => [
                'id' => $s->id,
                'content' => $s->content,
                'status' => $s->status,
                'submitted_at' => optional($s->submitted_at)?->toDateTimeString(),
                'assignment' => $s->assignment ? [
                    'id' => $s->assignment->id,
                    'title' => $s->assignment->title,
                    'max_score' => $s->assignment->max_score,
                    'due_at' => optional($s->assignment->due_at)?->toDateTimeString(),
                    'course' => $s->assignment->course ? ['id' => $s->assignment->course->id, 'title' => $s->assignment->course->title, 'slug' => $s->assignment->course->slug] : null,
                ] : null,
                'grade' => $s->grade ? [
                    'score' => (float) $s->grade->score,
                    'feedback' => $s->grade->feedback,
                    'graded_at' => optional($s->grade->graded_at)?->toDateTimeString(),
                ] : null,
                'files' => $s->files->map(fn ($f) => ['id' => $f->id, 'name' => $f->original_name, 'type' => $f->file_type, 'size' => $f->file_size])->values(),
            ])->values();

        return Inertia::render('Student/Submissions/Index', [
            'submissions' => $submissions,
        ]);
    }
}