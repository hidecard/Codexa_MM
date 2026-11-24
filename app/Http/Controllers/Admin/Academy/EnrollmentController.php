<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    private const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    public function index(): Response
    {
        $enrollments = Enrollment::query()
            ->with(['student:id,name', 'course:id,title'])
            ->latest('enrolled_at')
            ->get()
            ->map(function (Enrollment $e) {
                $name = $e->student?->name ?? 'Unknown';
                $initials = collect(explode(' ', trim($name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

                return [
                    'id' => $e->id,
                    'student' => $name,
                    'init' => $initials ?: '?',
                    'col' => self::COLORS[$e->student_id % count(self::COLORS)],
                    'course' => $e->course?->title ?? '—',
                    'status' => $e->status,
                    'price' => (float) $e->price_paid,
                    'enrolled_at' => optional($e->enrolled_at)?->toDateString(),
                    'completed_at' => optional($e->completed_at)?->toDateString(),
                ];
            })->values();

        return Inertia::render('Admin/Academy/Enrollments/Index', [
            'enrollments' => $enrollments,
        ]);
    }
}
