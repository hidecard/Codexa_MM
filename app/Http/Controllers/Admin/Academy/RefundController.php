<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use Inertia\Inertia;
use Inertia\Response;

class RefundController extends Controller
{
    public function index(): Response
    {
        // Refund is payment-linked (invoice payments); the student/course are
        // not directly reachable, so the page shows the payment reference.
        $refunds = Refund::query()
            ->with(['payment:id,amount,method'])
            ->latest()
            ->get()
            ->map(fn (Refund $r) => [
                'id' => $r->id,
                'student' => 'Payment #'.$r->payment_id,
                'course' => $r->payment ? ($r->payment->method.' · Invoice #'.$r->payment->invoice_id) : '—',
                'amount' => (float) $r->amount,
                'reason' => $r->reason,
                'date' => optional($r->created_at)?->toDateString() ?? '',
                'status' => $r->status,
            ])->values();

        return Inertia::render('Admin/Academy/Refunds/Index', [
            'refunds' => $refunds,
        ]);
    }
}
