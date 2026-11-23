<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RefundController extends Controller
{
    public function index(): Response
    {
        // Course-linked refunds show the student/course; invoice-linked
        // refunds (Solutions) still show the payment reference.
        $refunds = Refund::query()
            ->with(['payment:id,amount,method,invoice_id', 'coursePayment.student:id,name', 'coursePayment.course:id,title'])
            ->latest()
            ->get()
            ->map(function (Refund $r) {
                $cp = $r->coursePayment;

                return [
                    'id' => $r->id,
                    'student' => $cp?->student?->name ?? 'Payment #'.$r->payment_id,
                    'course' => $cp
                        ? ($cp->course?->title ?? 'Pro Plan — လစဉ်')
                        : ($r->payment ? ($r->payment->method.' · Invoice #'.$r->payment->invoice_id) : '—'),
                    'amount' => (float) $r->amount,
                    'reason' => $r->reason,
                    'date' => optional($r->created_at)?->toDateString() ?? '',
                    'status' => $r->status,
                ];
            })->values();

        return Inertia::render('Admin/Academy/Refunds/Index', [
            'refunds' => $refunds,
        ]);
    }

    public function approve(Refund $refund): RedirectResponse
    {
        if ($refund->status !== 'pending') {
            return back()->with('error', 'စောင့်ဆိုင်းဆဲ တောင်းခံမှုကိုသာ အတည်ပြုနိုင်ပါတယ်။');
        }

        $refund->update(['status' => 'approved']);

        // A course-linked refund also marks the original payment refunded
        // (and revokes the enrollment); invoice-linked refunds only change
        // the refund status.
        $refund->coursePayment?->markRefunded();

        return back()->with('success', 'Refund တောင်းခံမှုကို အတည်ပြုပြီးပါပြီ။');
    }

    public function reject(Refund $refund): RedirectResponse
    {
        if ($refund->status !== 'pending') {
            return back()->with('error', 'စောင့်ဆိုင်းဆဲ တောင်းခံမှုကိုသာ ပယ်ချနိုင်ပါတယ်။');
        }

        $refund->update(['status' => 'rejected']);

        return back()->with('success', 'Refund တောင်းခံမှုကို ပယ်ချပြီးပါပြီ။');
    }

    public function process(Refund $refund): RedirectResponse
    {
        if ($refund->status !== 'approved') {
            return back()->with('error', 'အတည်ပြုပြီး တောင်းခံမှုကိုသာ ငွေပြန်အမ်းပြီး မှတ်နိုင်ပါတယ်။');
        }

        $refund->update(['status' => 'processed']);

        return back()->with('success', 'Refund ငွေပြန်အမ်းပြီးအဖြစ် မှတ်သားပြီးပါပြီ။');
    }
}
