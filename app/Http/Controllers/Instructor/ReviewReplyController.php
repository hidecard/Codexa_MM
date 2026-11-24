<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewReplyController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $courseIds = Course::query()
            ->where(fn (Builder $q) => $q->where('instructor_id', $user->id)->orWhereHas('instructors', fn (Builder $qq) => $qq->whereKey($user->id)))
            ->pluck('id');

        $reviews = CourseReview::query()
            ->with(['student:id,name', 'course:id,title'])
            ->whereIn('course_id', $courseIds)
            ->where('is_hidden', false)
            ->latest()
            ->get()
            ->map(fn (CourseReview $r) => [
                'id' => $r->id,
                'name' => $r->student?->name ?? 'ကျောင်းသား',
                'course' => $r->course?->title ?? '',
                'stars' => (int) $r->rating,
                'text' => $r->comment ?? '',
                'date' => optional($r->created_at)?->toDateString(),
                'status' => $r->is_approved ? 'approved' : 'pending',
                'reply' => $r->reply,
            ])->values();

        return Inertia::render('Instructor/Reviews/Index', [
            'reviews' => $reviews,
        ]);
    }

    public function reply(Request $request, CourseReview $review): RedirectResponse
    {
        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:2000'],
        ]);

        abort_unless($this->teaches($request->user(), $review->course), 403);

        $review->update(['reply' => $validated['reply']]);

        return back()->with('success', 'အကြောင်းပြန်ချက် ပို့ပြီးပါပြီ');
    }

    private function teaches(User $user, ?Course $course): bool
    {
        if ($course === null) {
            return false;
        }

        return $course->instructor_id === $user->id
            || $course->instructors()->whereKey($user->id)->exists();
    }
}
