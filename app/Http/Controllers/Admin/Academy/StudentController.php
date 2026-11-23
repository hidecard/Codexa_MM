<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    private const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    public function index(): Response
    {
        $students = User::query()
            ->role('student')
            ->withCount(['enrollments', 'enrollments as completed_count' => fn ($q) => $q->where('status', 'completed')])
            ->latest()
            ->get()
            ->map(function (User $u) {
                $total = max(1, $u->enrollments_count);
                $initials = collect(explode(' ', trim($u->name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'init' => $initials ?: '?',
                    'col' => self::COLORS[$u->id % count(self::COLORS)],
                    'email' => $u->email,
                    'city' => $u->profile?->address ?? '—',
                    'courses' => $u->enrollments_count,
                    'xp' => 0, // No XP model yet.
                    'prog' => (int) round(($u->completed_count / $total) * 100),
                    'plan' => 'free', // No plan/subscription model yet.
                    'active' => optional($u->updated_at)?->toDateString() ?? '—',
                    'status' => 'active',
                ];
            })->values();

        return Inertia::render('Admin/Academy/Students/Index', [
            'students' => $students,
            'total' => $students->count(),
        ]);
    }
}
