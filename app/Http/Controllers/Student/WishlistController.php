<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Wishlist;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        $courseIds = Wishlist::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->pluck('course_id');

        $courses = Course::query()
            ->with(['category:id,name', 'instructor:id,name'])
            ->withCount(['enrollments as students_count' => fn (Builder $q) => $q->whereIn('status', ['active', 'completed'])])
            ->withAvg(['reviews as rating_avg' => fn (Builder $q) => $q->where('is_approved', true)], 'rating')
            ->whereIn('id', $courseIds)
            ->get()
            ->sortBy(fn (Course $course) => array_search($course->id, $courseIds->all()))
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'slug' => $course->slug,
                'title' => $course->title,
                'category' => $course->category?->name,
                'instructor' => $course->instructor?->name,
                'price' => (float) ($course->sale_price ?? $course->price),
                'oldPrice' => $course->sale_price !== null ? (float) $course->price : null,
                'rating' => round((float) ($course->rating_avg ?? 0), 1),
                'students' => (int) $course->students_count,
                'level' => $course->level,
            ])->values();

        return Inertia::render('Student/Wishlist', [
            'courses' => $courses,
        ]);
    }

    /** Add a course to the wishlist (idempotent). */
    public function store(Request $request, Course $course): RedirectResponse
    {
        Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'course_id' => $course->id,
        ]);

        return back()->with('success', 'သိမ်းထားသော သင်တန်းများထဲ ထည့်ပြီးပါပြီ');
    }

    public function destroy(Request $request, Course $course): RedirectResponse
    {
        Wishlist::query()
            ->where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->delete();

        return back()->with('success', 'သိမ်းထားသော သင်တန်းများမှ ဖယ်ရှားပြီးပါပြီ');
    }
}
