<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CourseReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            ->map(fn (CourseReview $r) => $this->mapReview($r))
            ->values();

        return Inertia::render('Admin/Academy/Reviews/Index', [
            'reviews' => $reviews,
            'stats' => [
                'average' => round((float) CourseReview::query()->avg('rating'), 1),
                'total' => CourseReview::query()->count(),
            ],
        ]);
    }

    public function approve(CourseReview $review): RedirectResponse
    {
        $review->update(['is_approved' => true, 'is_hidden' => false]);

        return back()->with('success', 'Review approved.');
    }

    public function hide(CourseReview $review): RedirectResponse
    {
        $review->update(['is_hidden' => true]);

        return back()->with('success', 'Review hidden.');
    }

    public function unhide(CourseReview $review): RedirectResponse
    {
        $review->update(['is_hidden' => false]);

        return back()->with('success', 'Review unhidden.');
    }

    public function reply(Request $request, CourseReview $review): RedirectResponse
    {
        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:2000'],
        ]);
        $review->update($validated);

        return back()->with('success', 'Reply saved.');
    }

    public function destroy(CourseReview $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Review deleted.');
    }

    private function mapReview(CourseReview $r): array
    {
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
            // There is no report model yet, so no review maps to 'reported'.
            'status' => $r->is_hidden ? 'hidden' : ($r->is_approved ? 'approved' : 'pending'),
            'reply' => $r->reply,
        ];
    }
}
