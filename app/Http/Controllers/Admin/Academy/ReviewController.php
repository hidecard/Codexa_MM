<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CourseReview;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    private const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    public function index(): Response
    {
        $reviews = CourseReview::query()
            ->with(['student:id,name', 'course:id,title'])
            ->latest()
            ->get()
            ->map(function (CourseReview $r) {
                $name = $r->student?->name ?? 'Unknown';
                $initials = collect(explode(' ', trim($name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

                return [
                    'id' => $r->id,
                    'name' => $name,
                    'init' => $initials ?: '?',
                    'col' => self::COLORS[$r->student_id % count(self::COLORS)],
                    'course' => $r->course?->title ?? '—',
                    'stars' => $r->rating,
                    'text' => $r->comment ?? '',
                    'date' => optional($r->created_at)?->toDateString() ?? '',
                    // The model only tracks approval; reported/hidden states don't exist yet.
                    'status' => $r->is_approved ? 'approved' : 'pending',
                ];
            })->values();

        return Inertia::render('Admin/Academy/Reviews/Index', [
            'reviews' => $reviews,
        ]);
    }
}
