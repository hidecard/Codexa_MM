<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        $user->load('profile');

        $courses = Course::query()
            ->withCount(['enrollments as students_count' => fn (Builder $q) => $q->whereIn('status', ['active', 'completed'])])
            ->withAvg(['reviews as rating_avg' => fn (Builder $q) => $q->where('is_approved', true)], 'rating')
            ->where(fn (Builder $q) => $q->where('instructor_id', $user->id)->orWhereHas('instructors', fn (Builder $qq) => $qq->whereKey($user->id)))
            ->orderBy('title')
            ->get(['id', 'title', 'slug']);

        $courseIds = $courses->pluck('id');

        $students = Enrollment::query()
            ->whereIn('course_id', $courseIds)
            ->whereIn('status', ['active', 'completed'])
            ->count();

        $reviewStats = CourseReview::query()
            ->whereIn('course_id', $courseIds)
            ->where('is_approved', true)
            ->selectRaw('COUNT(*) as total, COALESCE(AVG(rating), 0) as average')
            ->first();

        return Inertia::render('Instructor/Profile', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'profile' => [
                'bio' => $user->profile?->bio,
                'phone' => $user->profile?->phone,
                'address' => $user->profile?->address,
            ],
            'stats' => [
                'courses' => $courses->count(),
                'students' => $students,
                'avgRating' => round((float) ($reviewStats->average ?? 0), 1),
                'reviewCount' => (int) ($reviewStats->total ?? 0),
            ],
            'courses' => $courses->map(fn (Course $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'students' => (int) $c->students_count,
                'rating' => $c->rating_avg !== null ? round((float) $c->rating_avg, 1) : null,
            ])->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $user->update(['name' => $validated['name']]);

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'bio' => $validated['bio'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ],
        );

        return back()->with('success', 'Profile သိမ်းပြီးပါပြီ');
    }
}
