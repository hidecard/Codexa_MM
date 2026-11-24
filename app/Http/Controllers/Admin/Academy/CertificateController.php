<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    private const COLORS = ['#ec4899', '#0ea892', '#6366f1', '#f59e0b', '#38bdf8', '#22c55e', '#8b5cf6', '#f43f5e', '#eab308', '#14b8a6'];

    public function index(): Response
    {
        $certificates = Certificate::query()
            ->with(['enrollment.student:id,name', 'enrollment.course:id,title', 'verification:id,certificate_id'])
            ->latest('issued_at')
            ->get()
            ->map(function (Certificate $c) {
                $name = $c->enrollment?->student?->name ?? 'Unknown';
                $initials = collect(explode(' ', trim($name)))->map(fn ($w) => Str::upper(Str::substr($w, 0, 1)))->take(2)->implode('');

                return [
                    'id' => $c->id,
                    'number' => $c->certificate_number,
                    'student' => $name,
                    'init' => $initials ?: '?',
                    'col' => self::COLORS[($c->enrollment?->student_id ?? 0) % count(self::COLORS)],
                    'course' => $c->enrollment?->course?->title ?? '—',
                    'issued_at' => optional($c->issued_at)?->toDateString(),
                    'verified' => $c->verification !== null,
                ];
            })->values();

        return Inertia::render('Admin/Academy/Certificates/Index', [
            'certificates' => $certificates,
        ]);
    }
}
