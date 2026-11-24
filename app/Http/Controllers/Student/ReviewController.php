<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\ReviewReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
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

        $enrolledCourses = Enrollment::query()
            ->with('course:id,title,slug')
            ->where('student_id', $request->user()->id)
            ->whereIn('status', ['active', 'completed'])
            ->get()
            ->map(fn (Enrollment $e) => $e->course)
            ->filter()
            ->unique('id')
            ->map(function ($course) use ($request) {
                $existing = CourseReview::query()
                    ->where('student_id', $request->user()->id)
                    ->where('course_id', $course->id)
                    ->first(['id', 'rating', 'comment']);

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'review' => $existing ? [
                        'id' => $existing->id,
                        'rating' => $existing->rating,
                        'comment' => $existing->comment,
                    ] : null,
                ];
            })->values();

        return Inertia::render('Student/Reviews/Index', [
            'reviews' => $reviews,
            'enrolledCourses' => $enrolledCourses,
        ]);
    }

    /**
     * Submit (or resubmit) a review for an enrolled course. One review per
     * student per course; resubmitting updates it and sends it back to
     * pending moderation.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $enrolled = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $validated['course_id'])
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        if (! $enrolled) {
            throw ValidationException::withMessages([
                'course_id' => 'စာရင်းသွင်းထားသော သင်တန်းကိုသာ သုံးသပ်ချက် ရေးနိုင်ပါသည်။',
            ]);
        }

        CourseReview::updateOrCreate(
            ['student_id' => $request->user()->id, 'course_id' => $validated['course_id']],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
                'is_approved' => false,
            ],
        );

        return back()->with('success', 'သုံးသပ်ချက် တင်ပြီးပါပြီ — အတည်ပြုရန် စောင့်နေပါသည်');
    }

    /**
     * Report another student's review for admin moderation. One report
     * per reporter per review (any status).
     */
    public function report(Request $request, CourseReview $review): RedirectResponse
    {
        if ($review->student_id === $request->user()->id) {
            throw ValidationException::withMessages([
                'reason' => 'ကိုယ့်ရဲ့ သုံးသပ်ချက်ကို ကိုယ်တိုင် report လုပ်၍ မရပါ။',
            ]);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $existing = ReviewReport::query()
            ->where('course_review_id', $review->id)
            ->where('reporter_id', $request->user()->id)
            ->first();

        if ($existing) {
            // One report per reporter per review (unique constraint) — a
            // dismissed/resolved report cannot be filed again either, so
            // answer with a friendly error instead of a 500.
            throw ValidationException::withMessages([
                'reason' => $existing->status === ReviewReport::STATUS_PENDING
                    ? 'ဒီ review ကို report လုပ်ထားပြီးပါပြီ — Admin စစ်ဆေးနေပါတယ်။'
                    : 'ဒီ review ကို report လုပ်ထားပြီးပါပြီ။',
            ]);
        }

        ReviewReport::create([
            'course_review_id' => $review->id,
            'reporter_id' => $request->user()->id,
            'reason' => $validated['reason'],
            'status' => ReviewReport::STATUS_PENDING,
        ]);

        return back()->with('success', 'Report တင်ပြီးပါပြီ — Admin အဖွဲ့က စစ်ဆေးပါမယ်။');
    }
}
