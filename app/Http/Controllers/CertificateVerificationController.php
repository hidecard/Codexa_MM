<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\CertificateVerification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateVerificationController extends Controller
{
    public function __invoke(Request $request, string $code): Response
    {
        $verification = CertificateVerification::query()
            ->with(['certificate.enrollment.course:id,title,slug', 'certificate.enrollment.student:id,name'])
            ->where('verification_code', $code)
            ->first();

        $valid = $verification && $verification->certificate;

        return Inertia::render('Public/VerifyCertificate', [
            'valid' => (bool) $valid,
            'code' => $code,
            'certificate' => $valid ? [
                'certificate_number' => $verification->certificate->certificate_number,
                'issued_at' => optional($verification->certificate->issued_at)?->toDateString(),
                'course' => $verification->certificate->enrollment?->course?->title,
                'student' => $verification->certificate->enrollment?->student?->name,
            ] : null,
        ]);
    }
}
