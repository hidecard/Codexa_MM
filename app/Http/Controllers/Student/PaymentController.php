<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CoursePayment;
use App\Models\LiveSession;
use App\Support\AcademyAnalytics;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    /**
     * The student's own payment history. Academy money flows through
     * CoursePayment ONLY — the invoice/project-based Payment model is
     * never queried here.
     */
    public function index(Request $request): Response
    {
        $payments = CoursePayment::query()
            ->with(['course:id,title,slug', 'order:id'])
            ->where('student_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (CoursePayment $payment) => [
                'id' => $payment->id,
                'order_id' => $payment->displayCode(),
                'title' => $payment->course?->title ?? ($payment->order_id ? 'Order #'.$payment->order_id : 'သင်တန်း'),
                'course_slug' => $payment->course?->slug,
                'amount' => (float) $payment->amount,
                'method' => AcademyAnalytics::methodLabel($payment->method),
                'status' => $payment->status,
                'paid_at' => optional($payment->reviewed_at ?? $payment->created_at)?->toDateString(),
                'date' => $this->myanmarDate($payment->created_at),
            ])->values();

        return Inertia::render('Student/Payments/Index', [
            'payments' => $payments,
        ]);
    }

    private function myanmarDate($date): string
    {
        if (! $date) {
            return '—';
        }

        return LiveSession::myanmarMonth((int) $date->format('n')).' '.$date->format('d');
    }
}
