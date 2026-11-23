<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    private const MONTHS_MY = [
        1 => 'ဇန်နဝါရီ', 2 => 'ဖေဖော်ဝါရီ', 3 => 'မတ်', 4 => 'ဧပြီ',
        5 => 'မေ', 6 => 'ဇွန်', 7 => 'ဇူလိုင်', 8 => 'ဩဂုတ်',
        9 => 'စက်တင်ဘာ', 10 => 'အောက်တိုဘာ', 11 => 'နိုဝင်ဘာ', 12 => 'ဒီဇင်ဘာ',
    ];

    public function index(): Response
    {
        $coupons = Coupon::query()
            ->latest()
            ->get()
            ->map(fn (Coupon $c) => [
                'id' => $c->id,
                'code' => $c->code,
                // The admin UI creates percent coupons; fixed-value coupons
                // show their value here and are applied at checkout.
                'pct' => (float) $c->discount_value,
                'used' => $c->used_count,
                'limit' => $c->usage_limit ?? 0,
                'expiry' => $c->expires_at !== null
                    ? $c->expires_at->year.' '.self::MONTHS_MY[$c->expires_at->month].' '.$c->expires_at->day
                    : 'သက်တမ်း မရှိ',
                'active' => $c->is_active,
            ])->values();

        return Inertia::render('Admin/Academy/Coupons/Index', [
            'coupons' => $coupons,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        Coupon::query()->create($validated);

        return back()->with('success', 'Coupon '.$validated['code'].' ဖန်တီးပြီးပါပြီ။');
    }

    public function update(Request $request, Coupon $coupon): RedirectResponse
    {
        $validated = $request->validate($this->rules($coupon));

        $coupon->update($validated);

        return back()->with('success', 'Coupon '.$coupon->code.' ပြင်ဆင်ပြီးပါပြီ။');
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $code = $coupon->code;
        $coupon->delete();

        return back()->with('success', 'Coupon '.$code.' ဖျက်ပြီးပါပြီ။');
    }

    public function toggle(Coupon $coupon): RedirectResponse
    {
        $coupon->update(['is_active' => ! $coupon->is_active]);

        return back()->with('success', 'Coupon '.$coupon->code.($coupon->is_active ? ' ပြန်ဖွင့်ပြီးပါပြီ။' : ' ပိတ်ပြီးပါပြီ။'));
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(?Coupon $coupon = null): array
    {
        // Codes are stored uppercase so CODEXA10 and codexa10 are one coupon.
        request()->merge(['code' => Str::upper((string) request()->input('code', ''))]);

        $type = request()->input('discount_type', 'percent');

        return [
            'code' => [
                'required', 'string', 'max:50',
                Rule::unique('coupons', 'code')->ignore($coupon?->id),
            ],
            'discount_type' => ['sometimes', Rule::in(['percent', 'fixed'])],
            'discount_value' => [
                'required', 'numeric', 'min:0.01',
                $type === 'percent' ? 'max:100' : 'max:100000000',
            ],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
