<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Course;
use App\Models\CoursePayment;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /** Cart page: courses currently in the session cart. */
    public function cart(Request $request): Response
    {
        return Inertia::render('Student/Cart/Index', [
            'courses' => $this->cartCourses($request),
        ]);
    }

    public function addToCart(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
        ]);

        $course = Course::query()->findOrFail($validated['course_id']);

        if ($this->isEnrolled($request->user()->id, $course->id)) {
            return back()->with('success', 'ဤသင်တန်းကို ဝယ်ယူပြီးသားဖြစ်သည်');
        }

        $cart = collect($request->session()->get('cart', []))->push($course->id)->unique()->values()->all();
        $request->session()->put('cart', $cart);

        return back()->with('success', 'ခြင်းတောင်းထဲ ထည့်ပြီးပါပြီ');
    }

    public function removeFromCart(Request $request, Course $course): RedirectResponse
    {
        $cart = collect($request->session()->get('cart', []))->reject(fn ($id) => (int) $id === $course->id)->values()->all();
        $request->session()->put('cart', $cart);

        return back()->with('success', 'ခြင်းတောင်းမှ ဖယ်ရှားပြီးပါပြီ');
    }

    /** Checkout page: session cart, or ?course_ids=1,2 for a buy-now flow. */
    public function checkout(Request $request): Response
    {
        $ids = $request->filled('course_ids')
            ? collect(explode(',', (string) $request->query('course_ids')))->map(fn ($id) => (int) $id)->filter()->values()->all()
            : $request->session()->get('cart', []);

        return Inertia::render('Student/Checkout/Index', [
            'courses' => $this->serializeCourses($ids),
            'gateways' => self::enabledGateways(),
        ]);
    }

    /**
     * Which payment gateways are enabled (admin settings `gateway_*`,
     * all enabled by default). Used by checkout display and order placement.
     *
     * @return array<string, bool>
     */
    public static function enabledGateways(): array
    {
        return [
            'kbzpay' => (bool) Setting::getValue('gateway_kbz', true),
            'wavepay' => (bool) Setting::getValue('gateway_wave', true),
            'cbpay' => (bool) Setting::getValue('gateway_cb', true),
            'bank' => (bool) Setting::getValue('gateway_bank', true),
        ];
    }

    /** Validate a coupon code for the cart/checkout summary (read-only). */
    public function validateCoupon(Request $request): JsonResponse
    {
        $code = strtoupper(trim((string) $request->query('code', '')));

        if ($code === '') {
            return response()->json(['valid' => false]);
        }

        $coupon = Coupon::query()->where('code', $code)->first();

        if ($coupon === null || ! $coupon->isUsable()) {
            return response()->json(['valid' => false]);
        }

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'discount_type' => $coupon->discount_type,
            'discount_value' => (float) $coupon->discount_value,
        ]);
    }

    /** Create an order + a pending course payment (awaiting admin approval). */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_ids' => ['required', 'array', 'min:1'],
            'course_ids.*' => ['integer', 'exists:courses,id'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'method' => ['required', 'string', 'in:kbzpay,wavepay,cbpay,bank'],
            'reference' => ['nullable', 'string', 'max:255'],
        ]);

        // A disabled gateway cannot be used even by posting directly.
        if (! (self::enabledGateways()[$validated['method']] ?? false)) {
            throw ValidationException::withMessages([
                'method' => 'ဤ ငွေပေးချေမှု နည်းလမ်း လက်ရှိ ပိတ်ထားပါသည်။',
            ]);
        }

        $userId = $request->user()->id;
        $courseIds = collect($validated['course_ids'])->unique()->values();

        // Drop courses the student already owns; nothing left means no order.
        $courseIds = $courseIds->reject(fn ($id) => $this->isEnrolled($userId, (int) $id))->values();

        if ($courseIds->isEmpty()) {
            throw ValidationException::withMessages([
                'course_ids' => 'ရွေးထားသော သင်တန်းများကို ဝယ်ယူပြီးသားဖြစ်သည်။',
            ]);
        }

        // A course already sitting in a pending order cannot be ordered again.
        $pendingCourseIds = Order::query()
            ->where('student_id', $userId)
            ->where('status', 'pending')
            ->with('items:id,order_id,course_id')
            ->get()
            ->flatMap(fn (Order $o) => $o->items->pluck('course_id'));

        if ($courseIds->intersect($pendingCourseIds)->isNotEmpty()) {
            throw ValidationException::withMessages([
                'course_ids' => 'ဤသင်တန်းအတွက် အတည်ပြုရန် စောင့်နေသော အော်ဒါ ရှိပြီးသားဖြစ်သည်။',
            ]);
        }

        $courses = Course::query()->whereIn('id', $courseIds)->get(['id', 'price', 'sale_price']);
        $prices = $courses->mapWithKeys(fn (Course $c) => [$c->id => (float) ($c->sale_price ?? $c->price)]);

        $subtotal = $prices->sum();
        $discount = 0;
        $couponCode = null;

        if (! empty($validated['coupon_code'])) {
            $coupon = Coupon::query()->where('code', strtoupper(trim($validated['coupon_code'])))->first();

            if ($coupon === null || ! $coupon->isUsable()) {
                throw ValidationException::withMessages([
                    'coupon_code' => 'ကူပွန် ကုဒ် မမှန်ကန်ပါ။',
                ]);
            }

            $couponCode = $coupon->code;
            $discount = $coupon->discount_type === 'fixed'
                ? min((float) $coupon->discount_value, $subtotal)
                : round($subtotal * ((float) $coupon->discount_value / 100), 2);
        }

        $total = max(0, round($subtotal - $discount, 2));

        $order = DB::transaction(function () use ($userId, $total, $couponCode, $courseIds, $prices, $validated) {
            $order = Order::create([
                'student_id' => $userId,
                'total' => $total,
                'status' => 'pending',
                'coupon_code' => $couponCode,
            ]);

            foreach ($courseIds as $courseId) {
                $order->items()->create([
                    'course_id' => $courseId,
                    'price' => $prices[$courseId],
                ]);
            }

            // One order-level payment (course_id null — it covers every item).
            // Admin approval of this payment is what unlocks the courses.
            CoursePayment::create([
                'student_id' => $userId,
                'course_id' => null,
                'order_id' => $order->id,
                'amount' => $total,
                'method' => $validated['method'],
                'status' => 'pending',
                'reference' => $validated['reference'] ?? null,
                'coupon_code' => $couponCode,
                'notes' => 'Order #'.$order->id,
            ]);

            return $order;
        });

        $request->session()->forget('cart');

        return back()->with('success', 'အော်ဒါ တင်ပြီးပါပြီ — အတည်ပြုရန် စောင့်နေပါသည် (Order #'.$order->id.')');
    }

    /** Order history page. */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        // Order-level payments are linked via notes ("Order #<id>").
        $paymentMethods = CoursePayment::query()
            ->where('student_id', $userId)
            ->where('notes', 'like', 'Order #%')
            ->get(['notes', 'method'])
            ->mapWithKeys(fn (CoursePayment $p) => [(int) Str::after((string) $p->notes, 'Order #') => $p->method]);

        $orders = Order::query()
            ->with(['items' => fn ($q) => $q->with('course:id,title,slug')->orderBy('id')])
            ->where('student_id', $userId)
            ->latest()
            ->get()
            ->map(function (Order $o) use ($paymentMethods) {
                $titles = $o->items->map(fn ($item) => $item->course?->title)->filter()->values();
                $first = $o->items->first();

                return [
                    'id' => $o->displayCode(),
                    'orderId' => $o->id,
                    'courseId' => $first?->course_id,
                    'title' => $titles->isEmpty()
                        ? 'သင်တန်း'
                        : $titles->first().($titles->count() > 1 ? ' +'.($titles->count() - 1).' ခု' : ''),
                    'items' => $titles->values()->all(),
                    'amount' => (float) $o->total,
                    'method' => $this->methodLabel($paymentMethods->get($o->id)),
                    'date' => optional($o->created_at)?->toDateString(),
                    'status' => $o->status,
                ];
            })->values();

        return Inertia::render('Student/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    private function cartCourses(Request $request): array
    {
        return $this->serializeCourses($request->session()->get('cart', []));
    }

    /** Serialize courses for the cart/checkout pages (effective sale price). */
    private function serializeCourses(array $ids): array
    {
        if (empty($ids)) {
            return [];
        }

        $courses = Course::query()
            ->with('instructor:id,name')
            ->withCount('lessons')
            ->whereIn('id', $ids)
            ->get(['id', 'slug', 'title', 'instructor_id', 'price', 'sale_price']);

        return $courses->map(fn (Course $c) => [
            'id' => $c->id,
            'slug' => $c->slug,
            'title' => $c->title,
            'instructor' => $c->instructor?->name,
            'price' => (float) ($c->sale_price ?? $c->price),
            'oldPrice' => $c->sale_price !== null ? (float) $c->price : null,
            'lessons' => $c->lessons_count,
        ])->values()->all();
    }

    private function isEnrolled(int $userId, int $courseId): bool
    {
        return Enrollment::query()
            ->where('student_id', $userId)
            ->where('course_id', $courseId)
            ->whereIn('status', ['active', 'completed'])
            ->exists();
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
