<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CoursePayment;
use App\Models\Enrollment;
use App\Support\ActivityLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    private const METHOD_LABELS = [
        'kbzpay' => 'KBZPay',
        'wavepay' => 'WavePay',
        'cbpay' => 'CB Pay',
        'bank' => 'Bank Transfer',
    ];

    private const METHOD_COLORS = [
        'kbzpay' => '#0ea5a4',
        'wavepay' => '#f59e0b',
        'cbpay' => '#2563eb',
        'bank' => '#64748b',
    ];

    private const MONTHS_MY = [
        1 => 'ဇန်နဝါရီ', 2 => 'ဖေဖော်ဝါရီ', 3 => 'မတ်', 4 => 'ဧပြီ',
        5 => 'မေ', 6 => 'ဇွန်', 7 => 'ဇူလိုင်', 8 => 'ဩဂုတ်',
        9 => 'စက်တင်ဘာ', 10 => 'အောက်တိုဘာ', 11 => 'နိုဝင်ဘာ', 12 => 'ဒီဇင်ဘာ',
    ];

    public function index(): Response
    {
        $payments = CoursePayment::query()
            ->with(['student:id,name', 'course:id,title'])
            ->latest()
            ->get()
            ->map(fn (CoursePayment $p) => [
                'pid' => $p->id,
                'id' => $p->displayCode(),
                'n' => $p->student?->name ?? 'Unknown',
                'item' => $p->course?->title ?? 'Pro Plan — လစဉ်',
                'method' => self::METHOD_LABELS[$p->method] ?? $p->method,
                'amount' => (float) $p->amount,
                'date' => self::formatDateTime($p->created_at),
                'status' => match ($p->status) {
                    'approved' => 'success',
                    'pending' => 'pending',
                    'refunded' => 'refunded',
                    default => 'rejected',
                },
            ])->values();

        $approved = CoursePayment::query()->where('status', 'approved');
        $today = (clone $approved)->whereDate('created_at', today());
        $week = (clone $approved)->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
        $month = (clone $approved)->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()]);

        $monthTotal = (float) $month->sum('amount');
        $payMix = (clone $month)
            ->selectRaw('method, SUM(amount) as total')
            ->groupBy('method')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'name' => self::METHOD_LABELS[$row->method] ?? $row->method,
                'pct' => $monthTotal > 0 ? (int) round(((float) $row->total / $monthTotal) * 100) : 0,
                'amount' => number_format((float) $row->total).' ကျပ်',
                'col' => self::METHOD_COLORS[$row->method] ?? '#64748b',
            ])->values();

        return Inertia::render('Admin/Academy/Payments/Index', [
            'payments' => $payments,
            'stats' => [
                'todayRevenue' => (float) $today->sum('amount'),
                'todayCount' => $today->count(),
                'weekRevenue' => (float) $week->sum('amount'),
                'monthRevenue' => $monthTotal,
                'monthCount' => $month->count(),
                'pendingCount' => CoursePayment::query()->where('status', 'pending')->count(),
            ],
            'payMix' => $payMix,
        ]);
    }

    public function approve(Request $request, CoursePayment $coursePayment): RedirectResponse
    {
        if ($coursePayment->status !== 'pending') {
            return back()->with('error', 'စောင့်ဆိုင်းဆဲ ပေးချေမှုကိုသာ အတည်ပြုနိုင်ပါတယ်။');
        }

        $coursePayment->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        // Order-level payments unlock every course on the order; single
        // course payments unlock that course; Pro-plan payments (no course
        // and no order) unlock nothing.
        if ($coursePayment->order_id !== null && $coursePayment->order !== null) {
            foreach ($coursePayment->order->items as $item) {
                self::activateEnrollment($coursePayment->student_id, $item->course_id, $item->price);
            }

            $coursePayment->order->update(['status' => 'paid']);
        } elseif ($coursePayment->course_id !== null) {
            self::activateEnrollment($coursePayment->student_id, $coursePayment->course_id, $coursePayment->amount);
        }

        if ($coursePayment->coupon_code) {
            Coupon::query()->where('code', $coursePayment->coupon_code)->increment('used_count');
        }

        ActivityLog::record('payment.approved', 'Approved payment '.$coursePayment->displayCode().' ('.number_format((float) $coursePayment->amount).' Ks)', $coursePayment);

        return back()->with('success', $coursePayment->displayCode().' ကို အတည်ပြုပြီးပါပြီ။');
    }

    /**
     * Create or activate the student's enrollment for a course. A pending
     * enrollment from checkout activates once payment clears; cancelled or
     * refunded enrollments are never resurrected.
     */
    private static function activateEnrollment(int $studentId, int $courseId, $amount): void
    {
        $enrollment = Enrollment::query()->firstOrCreate(
            ['student_id' => $studentId, 'course_id' => $courseId],
            ['status' => 'active', 'price_paid' => $amount, 'enrolled_at' => now()],
        );

        if ($enrollment->status === 'pending') {
            $enrollment->update([
                'status' => 'active',
                'price_paid' => $amount,
                'enrolled_at' => now(),
            ]);
        }
    }

    public function reject(Request $request, CoursePayment $coursePayment): RedirectResponse
    {
        if ($coursePayment->status !== 'pending') {
            return back()->with('error', 'စောင့်ဆိုင်းဆဲ ပေးချေမှုကိုသာ ပယ်ချနိုင်ပါတယ်။');
        }

        $coursePayment->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        ActivityLog::record('payment.rejected', 'Rejected payment '.$coursePayment->displayCode(), $coursePayment, level: 'warning');

        return back()->with('success', $coursePayment->displayCode().' ကို ပယ်ချပြီးပါပြီ။');
    }

    public function refund(Request $request, CoursePayment $coursePayment): RedirectResponse
    {
        if ($coursePayment->status !== 'approved') {
            return back()->with('error', 'အတည်ပြုပြီး ပေးချေမှုကိုသာ ငွေပြန်အမ်းနိုင်ပါတယ်။');
        }

        $coursePayment->update([
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);
        $coursePayment->markRefunded();

        ActivityLog::record('payment.refunded', 'Refunded payment '.$coursePayment->displayCode().' ('.number_format((float) $coursePayment->amount).' Ks) — course access revoked', $coursePayment, level: 'warning');

        return back()->with('success', $coursePayment->displayCode().' ကို ငွေပြန်အမ်းအဖြစ် မှတ်သားပြီးပါပြီ။');
    }

    private static function formatDateTime(?Carbon $date): string
    {
        if ($date === null) {
            return '';
        }

        return self::MONTHS_MY[$date->month].' '.$date->day.' · '.$date->format('H:i');
    }
}
