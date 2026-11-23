<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseReview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $reviews = CourseReview::query()
            ->with('course:id,title,slug')
            ->where('student_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (CourseReview $r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'is_approved' => (bool) $r->is_approved,
                'created_at' => optional($r->created_at)?->toDateString(),
                'course' => $r->course ? [
                    'id' => $r->course->id,
                    'title' => $r->course->title,
                    'slug' => $r->course->slug,
                ] : null,
            ])->values();

        return Inertia::render('Student/Reviews/Index', [
            'reviews' => $reviews,
        ]);
    }
}
