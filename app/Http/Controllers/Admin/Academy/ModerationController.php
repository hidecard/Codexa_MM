<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CommunityPost;
use App\Models\CourseReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

// Moderation covers REPORTED course reviews (hidden or awaiting approval)
// plus community posts (hide/unhide/delete).
class ModerationController extends Controller
{
    private const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    public function index(): Response
    {
        $reports = CourseReview::query()
            ->with(['student:id,name', 'course:id,title'])
            ->where(fn ($q) => $q->where('is_hidden', true)->orWhere('is_approved', false))
            ->latest()
            ->get()
            ->map(function (CourseReview $r) {
                $name = $r->student?->name ?? 'Unknown';
                $initials = collect(explode(' ', trim($name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

                return [
                    'id' => $r->id,
                    'author' => $name,
                    'init' => $initials ?: '?',
                    'col' => self::COLORS[$r->student_id % count(self::COLORS)],
                    'post' => $r->comment ?? '',
                    'course' => $r->course?->title ?? '—',
                    // No report model exists, so the reason is the review's state.
                    'reason' => $r->is_hidden ? 'Admin က ဖျောက်ထားသော review' : 'အတည်ပြုရန် စောင့်ဆိုင်းနေသော review',
                    'reporter' => '—',
                    'date' => optional($r->created_at)?->toDateString() ?? '',
                    'status' => $r->is_hidden ? 'hidden' : 'pending',
                ];
            })->values();

        $posts = CommunityPost::query()
            ->with('user:id,name')
            ->latest()
            ->get()
            ->map(function (CommunityPost $p) {
                $name = $p->user?->name ?? 'Unknown';
                $initials = collect(explode(' ', trim($name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

                return [
                    'id' => $p->id,
                    'author' => $name,
                    'init' => $initials ?: '?',
                    'col' => self::COLORS[$p->user_id % count(self::COLORS)],
                    'title' => $p->title,
                    'body' => $p->body ?? '',
                    'cat' => $p->category,
                    'date' => optional($p->created_at)?->toDateString() ?? '',
                    'status' => $p->status,
                ];
            })->values();

        return Inertia::render('Admin/Academy/Moderation/Index', [
            'reports' => $reports,
            'posts' => $posts,
        ]);
    }

    // Dismiss the report: the review is fine, approve and show it.
    public function approve(CourseReview $review): RedirectResponse
    {
        $review->update(['is_approved' => true, 'is_hidden' => false]);

        return back()->with('success', 'Review kept and approved.');
    }

    public function hide(CourseReview $review): RedirectResponse
    {
        $review->update(['is_hidden' => true]);

        return back()->with('success', 'Review hidden.');
    }

    public function destroy(CourseReview $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Review removed.');
    }

    // --- Community posts ---

    public function hidePost(CommunityPost $post): RedirectResponse
    {
        $post->update(['status' => CommunityPost::STATUS_HIDDEN]);

        return back()->with('success', 'Post hidden.');
    }

    public function unhidePost(CommunityPost $post): RedirectResponse
    {
        $post->update(['status' => CommunityPost::STATUS_PUBLISHED]);

        return back()->with('success', 'Post published again.');
    }

    public function destroyPost(CommunityPost $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'Post removed.');
    }
}
