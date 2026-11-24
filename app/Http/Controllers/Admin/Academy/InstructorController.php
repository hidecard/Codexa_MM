<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\InstructorApplication;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InstructorController extends Controller
{
    private const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    public function index(): Response
    {
        $instructors = User::query()
            ->role('instructor')
            ->with(['taughtCourses:id,instructor_id,price'])
            ->withCount('taughtCourses')
            ->latest()
            ->get();

        $courseIds = $instructors->flatMap(fn (User $u) => $u->taughtCourses->pluck('id'))->unique()->values();
        $enrollmentCounts = $courseIds->isEmpty()
            ? collect()
            : Enrollment::query()->whereIn('course_id', $courseIds)->selectRaw('course_id, count(*) as c')->groupBy('course_id')->pluck('c', 'course_id');
        $ratings = $courseIds->isEmpty()
            ? collect()
            : CourseReview::query()->whereIn('course_id', $courseIds)->selectRaw('course_id, avg(rating) as r')->groupBy('course_id')->pluck('r', 'course_id');

        $rows = $instructors->map(function (User $u) use ($enrollmentCounts, $ratings) {
            $students = 0;
            $revenue = 0.0;
            $ratingSum = 0.0;
            $ratingN = 0;
            foreach ($u->taughtCourses as $course) {
                $n = (int) ($enrollmentCounts[$course->id] ?? 0);
                $students += $n;
                $revenue += (float) $course->price * $n;
                if (isset($ratings[$course->id])) {
                    $ratingSum += (float) $ratings[$course->id];
                    $ratingN++;
                }
            }
            $initials = collect(explode(' ', trim($u->name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

            return [
                'id' => $u->id,
                'name' => $u->name,
                'init' => $initials ?: '?',
                'col' => self::COLORS[$u->id % count(self::COLORS)],
                'field' => 'Instructor',
                'courses' => $u->taught_courses_count,
                'students' => $students,
                'rating' => $ratingN ? round($ratingSum / $ratingN, 1) : 0,
                'share' => (int) round($revenue * 0.5),
                'payout' => 'pending', // No payout model yet.
                'status' => $u->status,
            ];
        })->values();

        $applications = InstructorApplication::query()
            ->with('user:id,name,email')
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->latest()
            ->get()
            ->map(function (InstructorApplication $a) {
                $name = $a->user?->name ?? 'Unknown';
                $initials = collect(explode(' ', trim($name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

                return [
                    'id' => $a->id,
                    'name' => $name,
                    'init' => $initials ?: '?',
                    'col' => self::COLORS[$a->user_id % count(self::COLORS)],
                    'email' => $a->user?->email ?? '',
                    'field' => $a->expertise,
                    'exp' => $a->experience ?? '—',
                    'note' => $a->bio ?? '',
                    'portfolio_links' => $a->portfolio_links ?? [],
                    'status' => $a->status,
                    'admin_note' => $a->admin_note,
                    'when' => optional($a->created_at)?->toDateString() ?? '',
                ];
            })->values();

        return Inertia::render('Admin/Academy/Instructors/Index', [
            'instructors' => $rows,
            'applications' => $applications,
        ]);
    }

    /**
     * Approve an application: the applicant becomes an instructor
     * (Spatie role) and can use the instructor portal.
     */
    public function approveApplication(Request $request, InstructorApplication $application): RedirectResponse
    {
        $validated = $request->validate(['admin_note' => ['nullable', 'string', 'max:1000']]);

        $application->update([
            'status' => InstructorApplication::STATUS_APPROVED,
            'admin_note' => $validated['admin_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);
        $application->user->assignRole('instructor');

        return back()->with('success', 'Application approved — instructor role assigned.');
    }

    public function rejectApplication(Request $request, InstructorApplication $application): RedirectResponse
    {
        $validated = $request->validate(['admin_note' => ['nullable', 'string', 'max:1000']]);

        $application->update([
            'status' => InstructorApplication::STATUS_REJECTED,
            'admin_note' => $validated['admin_note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Application rejected.');
    }

    public function activate(User $instructor): RedirectResponse
    {
        abort_unless($instructor->hasRole('instructor'), 404);
        $instructor->update(['status' => 'active']);

        return back()->with('success', 'Instructor activated.');
    }

    public function suspend(User $instructor): RedirectResponse
    {
        abort_unless($instructor->hasRole('instructor'), 404);
        $instructor->update(['status' => 'suspended']);

        return back()->with('success', 'Instructor suspended.');
    }
}
