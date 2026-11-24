<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(): Response
    {
        $assignments = Assignment::query()
            ->with(['course:id,title,instructor_id', 'course.instructor:id,name'])
            ->withCount(['submissions', 'submissions as graded_count' => fn ($q) => $q->whereIn('status', ['graded', 'returned'])])
            ->latest()
            ->get()
            ->map(fn (Assignment $a) => [
                'id' => $a->id,
                'title' => $a->title,
                'course' => $a->course?->title ?? '—',
                'instructor' => $a->course?->instructor?->name ?? '—',
                'max_score' => $a->max_score,
                'due_at' => optional($a->due_at)?->toDateString(),
                'submissions' => $a->submissions_count,
                'graded' => $a->graded_count,
                'status' => $a->due_at && $a->due_at->isPast() ? 'closed' : 'open',
            ])->values();

        return Inertia::render('Admin/Academy/Assignments/Index', [
            'assignments' => $assignments,
        ]);
    }
}
