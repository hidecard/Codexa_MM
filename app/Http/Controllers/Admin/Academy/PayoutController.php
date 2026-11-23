<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    private const MONTHS_MY = [
        1 => 'ဇန်နဝါရီ', 2 => 'ဖေဖော်ဝါရီ', 3 => 'မတ်', 4 => 'ဧပြီ',
        5 => 'မေ', 6 => 'ဇွန်', 7 => 'ဇူလိုင်', 8 => 'ဩဂုတ်',
        9 => 'စက်တင်ဘာ', 10 => 'အောက်တိုဘာ', 11 => 'နိုဝင်ဘာ', 12 => 'ဒီဇင်ဘာ',
    ];

    public function index(): Response
    {
        $payouts = Payout::query()
            ->with(['instructor:id,name'])
            ->latest()
            ->get()
            ->map(fn (Payout $p) => [
                'pid' => $p->id,
                'id' => $p->displayCode(),
                'name' => $p->instructor?->name ?? 'Unknown',
                'amount' => (float) $p->amount,
                'method' => $p->method,
                'date' => self::formatDate($p->created_at),
                'status' => $p->status,
            ])->values();

        $instructors = User::query()
            ->role('instructor')
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Academy/Payouts/Index', [
            'payouts' => $payouts,
            'instructors' => $instructors,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'instructor_id' => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric', 'min:1'],
            'method' => ['required', 'string', 'max:50'],
            'period' => ['nullable', 'string', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        Payout::query()->create([...$validated, 'status' => 'pending']);

        return back()->with('success', 'Payout မှတ်တမ်း ဖန်တီးပြီးပါပြီ။');
    }

    public function approve(Payout $payout): RedirectResponse
    {
        if (! in_array($payout->status, ['pending', 'hold'], true)) {
            return back()->with('error', 'စောင့်ဆိုင်းဆဲ (သို့) ဆိုင်းငံ့ထားသော payout ကိုသာ ပေးချေနိုင်ပါတယ်။');
        }

        $payout->update(['status' => 'paid', 'paid_at' => now()]);

        return back()->with('success', $payout->displayCode().' ကို ပေးချေပြီးအဖြစ် မှတ်သားပြီးပါပြီ။');
    }

    public function hold(Payout $payout): RedirectResponse
    {
        if ($payout->status !== 'pending') {
            return back()->with('error', 'စောင့်ဆိုင်းဆဲ payout ကိုသာ ဆိုင်းငံ့နိုင်ပါတယ်။');
        }

        $payout->update(['status' => 'hold']);

        return back()->with('success', $payout->displayCode().' ကို ဆိုင်းငံ့ထားပြီးပါပြီ။');
    }

    public function reject(Payout $payout): RedirectResponse
    {
        if (! in_array($payout->status, ['pending', 'hold'], true)) {
            return back()->with('error', 'စောင့်ဆိုင်းဆဲ (သို့) ဆိုင်းငံ့ထားသော payout ကိုသာ ပယ်ချနိုင်ပါတယ်။');
        }

        $payout->update(['status' => 'rejected']);

        return back()->with('success', $payout->displayCode().' ကို ပယ်ချပြီးပါပြီ။');
    }

    private static function formatDate(?Carbon $date): string
    {
        if ($date === null) {
            return '';
        }

        return self::MONTHS_MY[$date->month].' '.$date->day;
    }
}
