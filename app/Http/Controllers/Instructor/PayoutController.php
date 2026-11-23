<?php

namespace App\Http\Controllers\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CoursePayment;
use App\Models\Payout;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    /** Instructor earnings page: only the payout card is wired to real data. */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $pending = Payout::query()
            ->where('instructor_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        return Inertia::render('Instructor/Earnings/Index', [
            'availableBalance' => $this->availableBalance($user),
            'pendingPayout' => $pending ? [
                'id' => $pending->id,
                'amount' => (float) $pending->amount,
                'method' => $pending->method,
                'period' => $pending->period,
                'created_at' => optional($pending->created_at)?->toDateString(),
            ] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $available = $this->availableBalance($user);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:'.$available],
            'method' => ['required', 'string', 'in:kbzpay,wavepay,cbpay,bank'],
        ]);

        Payout::create([
            'instructor_id' => $user->id,
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'status' => 'pending',
            'period' => now()->format('Y-m'),
        ]);

        return back()->with('success', 'Payout တောင်းဆိုမှု ပို့ပြီးပါပြီ — Admin အတည်ပြုရန် စောင့်နေပါသည်');
    }

    /**
     * Instructor's withdrawable share: 50% of approved payments for their
     * courses, minus payouts already paid or pending. Order-level payments
     * (course_id null) are not attributed to a single instructor yet.
     */
    private function availableBalance(User $user): float
    {
        $courseIds = Course::query()
            ->where(fn (Builder $q) => $q->where('instructor_id', $user->id)->orWhereHas('instructors', fn (Builder $qq) => $qq->whereKey($user->id)))
            ->pluck('id');

        $earned = (float) CoursePayment::query()
            ->whereIn('course_id', $courseIds)
            ->where('status', 'approved')
            ->sum('amount') * 0.5;

        $claimed = (float) Payout::query()
            ->where('instructor_id', $user->id)
            ->whereIn('status', ['pending', 'paid'])
            ->sum('amount');

        return max(0, round($earned - $claimed, 2));
    }
}
