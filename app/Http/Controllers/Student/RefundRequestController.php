<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CoursePayment;
use App\Models\Refund;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RefundRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $refunds = Refund::query()
            ->with('coursePayment.course:id,title')
            ->whereHas('coursePayment', fn ($q) => $q->where('student_id', $user->id))
            ->latest()
            ->get()
            ->map(function (Refund $r) {
                [$reason, $detail] = array_pad(explode("\n\n", $r->reason ?? '', 2), 2, null);

                return [
                    'id' => $r->id,
                    'course' => $r->coursePayment?->course?->title ?? 'သင်တန်း',
                    'amount' => (float) $r->amount,
                    'method' => $this->methodLabel($r->coursePayment?->method),
                    'reason' => $reason,
                    'detail' => $detail,
                    'date' => optional($r->created_at)?->toDateString(),
                    'status' => $r->status,
                    'adminNote' => null,
                ];
            })->values();

        // Approved payments the student can still ask a refund for (no open
        // or approved refund already filed for that payment).
        $payments = CoursePayment::query()
            ->with('course:id,title')
            ->where('student_id', $user->id)
            ->where('status', 'approved')
            ->whereNotExists(fn ($q) => $q->selectRaw('1')->from('refunds')
                ->whereColumn('refunds.course_payment_id', 'course_payments.id')
                ->whereIn('refunds.status', ['pending', 'approved']))
            ->latest()
            ->get()
            ->map(fn (CoursePayment $p) => [
                'id' => $p->id,
                'course' => $p->course?->title ?? 'သင်တန်း',
                'amount' => (float) $p->amount,
                'method' => $this->methodLabel($p->method),
                'date' => optional($p->created_at)?->toDateString(),
            ])->values();

        return Inertia::render('Student/Refunds/Index', [
            'refunds' => $refunds,
            'payments' => $payments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_payment_id' => ['required', 'integer', 'exists:course_payments,id'],
            'reason' => ['required', 'string', 'max:255'],
            'detail' => ['nullable', 'string', 'max:2000'],
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $payment = CoursePayment::query()->findOrFail($validated['course_payment_id']);

        abort_unless($payment->student_id === $request->user()->id, 403);

        if ($payment->status !== 'approved') {
            throw ValidationException::withMessages([
                'course_payment_id' => 'အတည်ပြုပြီးသော ငွေပေးချေမှုကိုသာ ငွေပြန်အမ်းရန် တောင်းဆိုနိုင်ပါသည်။',
            ]);
        }

        if ((float) $validated['amount'] > (float) $payment->amount) {
            throw ValidationException::withMessages([
                'amount' => 'တောင်းဆိုငွေသည် ပေးချေခဲ့သော ငွေထက် များနေပါသည်။',
            ]);
        }

        $duplicate = Refund::query()
            ->where('course_payment_id', $payment->id)
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($duplicate) {
            throw ValidationException::withMessages([
                'course_payment_id' => 'ဤငွေပေးချေမှုအတွက် တောင်းဆိုမှု တစ်ခု ရှိပြီးသားဖြစ်သည်။',
            ]);
        }

        $reason = $validated['reason'];
        if (! empty($validated['detail'])) {
            $reason .= "\n\n".$validated['detail'];
        }

        Refund::create([
            'course_payment_id' => $payment->id,
            'amount' => $validated['amount'],
            'reason' => $reason,
            'status' => 'pending',
        ]);

        return back()->with('success', 'တောင်းဆိုမှု လက်ခံရရှိပါပြီ — Support အဖွဲ့က 3 ရက် အတွင်း အကြောင်းပြန်ပါမည်');
    }

    private function methodLabel(?string $method): string
    {
        return match ($method) {
            'kbzpay' => 'KBZPay',
            'wavepay' => 'WavePay',
            'cbpay' => 'CB Pay',
            'bank' => 'Bank Transfer',
            default => '—',
        };
    }
}
