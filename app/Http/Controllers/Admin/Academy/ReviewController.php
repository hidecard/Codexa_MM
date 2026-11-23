<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CourseReview;
use App\Models\ReviewReport;
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
        $reportedIds = ReviewReport::query()
            ->where('status', ReviewReport::STATUS_PENDING)
            ->pluck('course_review_id')
            ->unique()
            ->all();

        $reviews = CourseReview::query()
            ->with(['student:id,name', 'course:id,title'])
            ->latest()
            ->get()
            ->map(fn (CourseReview $r) => $this->mapReview($r, in_array($r->id, $reportedIds, true)))
            ->values();

        $reports = ReviewReport::query()
            ->with(['reporter:id,name', 'review:id,course_id,student_id,rating,comment', 'review.course:id,title', 'review.student:id,name'])
            ->where('status', ReviewReport::STATUS_PENDING)
            ->latest()
            ->get()
            ->map(function (ReviewReport $report) {
                $review = $report->review;

                return [
                    'id' => $report->id,
                    'review_id' => $report->course_review_id,
                    'reporter' => $report->reporter?->name ?? 'Unknown',
                    'reason' => $report->reason,
                    'date' => optional($report->created_at)?->toDateString() ?? '',
                    'review' => $review ? [
                        'author' => $review->student?->name ?? 'Unknown',
                        'course' => $review->course?->title ?? '—',
                        'stars' => $review->rating,
                        'text' => $review->comment ?? '',
                    ] : null,
                ];
            })->values();

        return Inertia::render('Admin/Academy/Reviews/Index', [
            'reviews' => $reviews,
            'reports' => $reports,
            'stats' => [
                'average' => round((float) CourseReview::query()->avg('rating'), 1),
                'total' => CourseReview::query()->count(),
            ],
        ]);
    }

    /**
     * Resolve a report: the report was valid, so hide the reported review
     * and resolve every pending report against it.
     */
    public function resolveReport(Request $request, ReviewReport $report): RedirectResponse
    {
        $report->review?->update(['is_hidden' => true]);
        ReviewReport::query()
            ->where('course_review_id', $report->course_review_id)
            ->where('status', ReviewReport::STATUS_PENDING)
            ->update([
                'status' => ReviewReport::STATUS_RESOLVED,
                'resolved_by' => $request->user()->id,
                'resolved_at' => now(),
            ]);

        return back()->with('success', 'Report resolved — review hidden.');
    }

    public function dismissReport(Request $request, ReviewReport $report): RedirectResponse
    {
        $report->update([
            'status' => ReviewReport::STATUS_DISMISSED,
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return back()->with('success', 'Report dismissed.');
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

    private function mapReview(CourseReview $r, bool $reported = false): array
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
            'status' => $r->is_hidden ? 'hidden' : ($reported ? 'reported' : ($r->is_approved ? 'approved' : 'pending')),
            'reply' => $r->reply,
        ];
    }
}
