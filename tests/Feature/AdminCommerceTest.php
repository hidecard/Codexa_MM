<?php

use App\Models\Client;
use App\Models\Course;
use App\Models\CoursePayment;
use App\Models\Coupon;
use App\Models\Enrollment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\Refund;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
});

function commerceMakeAdmin(): User
{
    $admin = User::factory()->create(['status' => 'active']);
    $admin->assignRole('admin');

    return $admin;
}

function commerceMakeStudent(): User
{
    $student = User::factory()->create(['status' => 'active']);
    $student->assignRole('student');

    return $student;
}

function commerceMakeCoursePayment(array $overrides = []): CoursePayment
{
    return CoursePayment::query()->create(array_merge([
        'student_id' => commerceMakeStudent()->id,
        'course_id' => Course::factory()->create()->id,
        'amount' => 95000,
        'method' => 'kbzpay',
        'status' => 'pending',
        'reference' => 'TXN-REF-1',
    ], $overrides));
}

function commerceMakeInvoicePayment(): Payment
{
    $client = Client::query()->create([
        'user_id' => User::factory()->create(['status' => 'active'])->id,
        'company_name' => 'Acme Co.',
    ]);
    $invoice = Invoice::query()->create([
        'client_id' => $client->id,
        'invoice_number' => 'INV-'.fake()->unique()->numberBetween(1000, 9999),
        'total' => 50000,
        'due_date' => now()->addWeek()->toDateString(),
    ]);

    return Payment::query()->create([
        'invoice_id' => $invoice->id,
        'amount' => 50000,
        'method' => 'bank',
        'status' => 'completed',
    ]);
}

test('an admin can view the payments index with mapped course payments and stats', function () {
    $admin = commerceMakeAdmin();
    $payment = commerceMakeCoursePayment(['status' => 'approved']);
    // Distinct timestamps so latest() ordering is deterministic.
    $payment->created_at = now()->subHour();
    $payment->save();
    commerceMakeCoursePayment(['status' => 'pending', 'amount' => 30000, 'course_id' => null]);

    $this->actingAs($admin)->get('/admin/academy/payments')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Payments/Index')
            ->has('payments', 2)
            ->where('payments.1.id', 'TXN-'.str_pad((string) $payment->id, 4, '0', STR_PAD_LEFT))
            ->where('payments.1.status', 'success')
            ->where('payments.1.item', $payment->course->title)
            ->where('payments.0.item', 'Pro Plan — လစဉ်')
            ->where('stats.todayRevenue', 95000)
            ->where('stats.pendingCount', 1)
            ->has('payMix', 1));
});

test('a non-admin cannot view the academy payments index', function () {
    $student = commerceMakeStudent();

    $this->actingAs($student)->get('/admin/academy/payments')->assertForbidden();
});

test('approving a pending course payment creates an active enrollment and records the reviewer', function () {
    $admin = commerceMakeAdmin();
    $payment = commerceMakeCoursePayment();

    $this->actingAs($admin)->post("/admin/academy/payments/{$payment->id}/approve")
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe('approved')
        ->and($payment->fresh()->reviewed_by)->toBe($admin->id)
        ->and($payment->fresh()->reviewed_at)->not->toBeNull();

    $enrollment = Enrollment::query()->first();
    expect($enrollment)->not->toBeNull()
        ->and($enrollment->student_id)->toBe($payment->student_id)
        ->and($enrollment->course_id)->toBe($payment->course_id)
        ->and($enrollment->status)->toBe('active')
        ->and((float) $enrollment->price_paid)->toBe(95000.0);
});

test('approving a Pro-plan payment creates no enrollment', function () {
    $admin = commerceMakeAdmin();
    $payment = commerceMakeCoursePayment(['course_id' => null, 'amount' => 30000]);

    $this->actingAs($admin)->post("/admin/academy/payments/{$payment->id}/approve")
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe('approved')
        ->and(Enrollment::query()->count())->toBe(0);
});

test('approving an already-approved payment is rejected', function () {
    $admin = commerceMakeAdmin();
    $payment = commerceMakeCoursePayment(['status' => 'approved']);

    $this->actingAs($admin)->post("/admin/academy/payments/{$payment->id}/approve")
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($payment->fresh()->status)->toBe('approved');
});

test('rejecting a pending payment marks it rejected', function () {
    $admin = commerceMakeAdmin();
    $payment = commerceMakeCoursePayment();

    $this->actingAs($admin)->post("/admin/academy/payments/{$payment->id}/reject")
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe('rejected')
        ->and(Enrollment::query()->count())->toBe(0);
});

test('refunding an approved payment marks the payment and enrollment refunded', function () {
    $admin = commerceMakeAdmin();
    $payment = commerceMakeCoursePayment(['status' => 'approved']);
    Enrollment::query()->create([
        'student_id' => $payment->student_id,
        'course_id' => $payment->course_id,
        'status' => 'active',
        'price_paid' => 95000,
        'enrolled_at' => now(),
    ]);

    $this->actingAs($admin)->post("/admin/academy/payments/{$payment->id}/refund")
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe('refunded')
        ->and(Enrollment::query()->first()->status)->toBe('refunded');
});

test('an admin can create a coupon with an uppercase-normalized code', function () {
    $admin = commerceMakeAdmin();

    $this->actingAs($admin)->post('/admin/academy/coupons', [
        'code' => 'welcome15',
        'discount_value' => 15,
        'usage_limit' => 200,
        'expires_at' => '2027-01-31',
    ])->assertRedirect();

    $coupon = Coupon::query()->first();
    expect($coupon->code)->toBe('WELCOME15')
        ->and($coupon->discount_type)->toBe('percent')
        ->and((float) $coupon->discount_value)->toBe(15.0)
        ->and($coupon->is_active)->toBeTrue();
});

test('coupon codes must be unique and percent discounts must be 1-100', function () {
    $admin = commerceMakeAdmin();
    Coupon::query()->create(['code' => 'CODEXA10', 'discount_type' => 'percent', 'discount_value' => 10]);

    $this->actingAs($admin)->post('/admin/academy/coupons', [
        'code' => 'codexa10',
        'discount_value' => 10,
    ])->assertSessionHasErrors('code');

    $this->actingAs($admin)->post('/admin/academy/coupons', [
        'code' => 'TOOBIG',
        'discount_value' => 150,
    ])->assertSessionHasErrors('discount_value');

    expect(Coupon::query()->count())->toBe(1);
});

test('an admin can toggle, update and delete a coupon', function () {
    $admin = commerceMakeAdmin();
    $coupon = Coupon::query()->create(['code' => 'FLASH50', 'discount_type' => 'percent', 'discount_value' => 50]);

    $this->actingAs($admin)->post("/admin/academy/coupons/{$coupon->id}/toggle")->assertRedirect();
    expect($coupon->fresh()->is_active)->toBeFalse();

    $this->actingAs($admin)->put("/admin/academy/coupons/{$coupon->id}", [
        'code' => 'FLASH50',
        'discount_value' => 40,
        'usage_limit' => 100,
    ])->assertRedirect();
    expect((float) $coupon->fresh()->discount_value)->toBe(40.0)
        ->and($coupon->fresh()->usage_limit)->toBe(100);

    $this->actingAs($admin)->delete("/admin/academy/coupons/{$coupon->id}")->assertRedirect();
    expect(Coupon::query()->count())->toBe(0);
});

test('an admin can view the coupons index with mapped coupons', function () {
    $admin = commerceMakeAdmin();
    Coupon::query()->create([
        'code' => 'CODEXA10', 'discount_type' => 'percent', 'discount_value' => 10,
        'usage_limit' => 1000, 'used_count' => 5, 'expires_at' => '2026-12-31',
    ]);

    $this->actingAs($admin)->get('/admin/academy/coupons')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Coupons/Index')
            ->has('coupons', 1)
            ->where('coupons.0.code', 'CODEXA10')
            ->where('coupons.0.pct', 10)
            ->where('coupons.0.used', 5)
            ->where('coupons.0.limit', 1000)
            ->where('coupons.0.active', true));
});

test('an admin can create a payout and approve, hold and reject payouts', function () {
    $admin = commerceMakeAdmin();
    $instructor = User::factory()->create(['status' => 'active']);
    $instructor->assignRole('instructor');

    $this->actingAs($admin)->post('/admin/academy/payouts', [
        'instructor_id' => $instructor->id,
        'amount' => 2950000,
        'method' => 'KBZPay',
        'period' => '2026-11',
    ])->assertRedirect();

    $payout = Payout::query()->first();
    expect($payout->status)->toBe('pending');

    $this->actingAs($admin)->post("/admin/academy/payouts/{$payout->id}/hold")->assertRedirect();
    expect($payout->fresh()->status)->toBe('hold');

    $this->actingAs($admin)->post("/admin/academy/payouts/{$payout->id}/approve")->assertRedirect();
    expect($payout->fresh()->status)->toBe('paid')
        ->and($payout->fresh()->paid_at)->not->toBeNull();

    $rejected = Payout::query()->create([
        'instructor_id' => $instructor->id, 'amount' => 100000, 'method' => 'WavePay', 'status' => 'pending',
    ]);
    $this->actingAs($admin)->post("/admin/academy/payouts/{$rejected->id}/reject")->assertRedirect();
    expect($rejected->fresh()->status)->toBe('rejected');
});

test('an admin can view the payouts index with instructors to choose from', function () {
    $admin = commerceMakeAdmin();
    $instructor = User::factory()->create(['name' => 'Thura Aung', 'status' => 'active']);
    $instructor->assignRole('instructor');
    Payout::query()->create([
        'instructor_id' => $instructor->id, 'amount' => 100000, 'method' => 'KBZPay', 'status' => 'pending',
    ]);

    $this->actingAs($admin)->get('/admin/academy/payouts')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Payouts/Index')
            ->has('payouts', 1)
            ->where('payouts.0.name', 'Thura Aung')
            ->where('payouts.0.status', 'pending')
            ->has('instructors', 1)
            ->where('instructors.0.name', 'Thura Aung'));
});

test('approving a course-linked refund also refunds the course payment and enrollment', function () {
    $admin = commerceMakeAdmin();
    $payment = commerceMakeCoursePayment(['status' => 'approved']);
    Enrollment::query()->create([
        'student_id' => $payment->student_id,
        'course_id' => $payment->course_id,
        'status' => 'active',
        'price_paid' => 95000,
        'enrolled_at' => now(),
    ]);
    $refund = Refund::query()->create([
        'payment_id' => commerceMakeInvoicePayment()->id,
        'course_payment_id' => $payment->id,
        'amount' => 95000,
        'reason' => 'Course not as expected',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)->post("/admin/academy/refunds/{$refund->id}/approve")
        ->assertRedirect();

    expect($refund->fresh()->status)->toBe('approved')
        ->and($payment->fresh()->status)->toBe('refunded')
        ->and(Enrollment::query()->first()->status)->toBe('refunded');

    $this->actingAs($admin)->post("/admin/academy/refunds/{$refund->id}/process")
        ->assertRedirect();
    expect($refund->fresh()->status)->toBe('processed');
});

test('approving an invoice-linked refund only changes the refund status', function () {
    $admin = commerceMakeAdmin();
    $invoicePayment = commerceMakeInvoicePayment();
    $refund = Refund::query()->create([
        'payment_id' => $invoicePayment->id,
        'amount' => 50000,
        'reason' => 'Project cancelled',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)->post("/admin/academy/refunds/{$refund->id}/approve")
        ->assertRedirect();

    expect($refund->fresh()->status)->toBe('approved')
        ->and($invoicePayment->fresh()->status)->toBe('completed');
});

test('rejecting a refund marks it rejected', function () {
    $admin = commerceMakeAdmin();
    $refund = Refund::query()->create([
        'payment_id' => commerceMakeInvoicePayment()->id,
        'amount' => 50000,
        'reason' => 'Changed my mind',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)->post("/admin/academy/refunds/{$refund->id}/reject")
        ->assertRedirect();

    expect($refund->fresh()->status)->toBe('rejected');
});

test('the refunds index shows the student and course for course-linked refunds', function () {
    $admin = commerceMakeAdmin();
    $payment = commerceMakeCoursePayment(['status' => 'approved']);
    Refund::query()->create([
        'payment_id' => commerceMakeInvoicePayment()->id,
        'course_payment_id' => $payment->id,
        'amount' => 95000,
        'reason' => 'Too hard',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)->get('/admin/academy/refunds')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Academy/Refunds/Index')
            ->has('refunds', 1)
            ->where('refunds.0.student', $payment->student->name)
            ->where('refunds.0.course', $payment->course->title));
});
