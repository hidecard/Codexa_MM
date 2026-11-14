<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function index(Request $request): Response
    {
        $enrollmentIds = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->pluck('id');

        $certificates = Certificate::query()
            ->with(['enrollment.course:id,title,slug', 'verification:id,certificate_id,verification_code'])
            ->whereIn('enrollment_id', $enrollmentIds)
            ->latest('issued_at')
            ->get()
            ->map(fn (Certificate $c) => [
                'id' => $c->id,
                'certificate_number' => $c->certificate_number,
                'issued_at' => optional($c->issued_at)?->toDateString(),
                'course' => $c->enrollment?->course ? [
                    'title' => $c->enrollment->course->title,
                    'slug' => $c->enrollment->course->slug,
                ] : null,
                'verification_code' => $c->verification?->verification_code,
            ])->values();

        return Inertia::render('Student/Certificates/Index', [
            'certificates' => $certificates,
        ]);
    }
}
