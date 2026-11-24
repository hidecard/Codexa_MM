<?php

// Admin Academy commerce writes: course payments, refunds, coupons,
// payouts. Loaded before routes/admin.php; the duplicate closure
// sample-data routes there were removed at integration.

use App\Http\Controllers\Admin\Academy\CouponController;
use App\Http\Controllers\Admin\Academy\PaymentController;
use App\Http\Controllers\Admin\Academy\PayoutController;
use App\Http\Controllers\Admin\Academy\RefundController as AcademyRefundController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin.access'])->prefix('admin')->name('admin.')->group(function () {
    Route::prefix('academy')->name('academy.')->group(function () {
        // Course payments (CoursePayment model; the invoice-based Payment
        // model is NOT used for academy payments).
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::post('/payments/{coursePayment}/approve', [PaymentController::class, 'approve'])->name('payments.approve');
        Route::post('/payments/{coursePayment}/reject', [PaymentController::class, 'reject'])->name('payments.reject');
        Route::post('/payments/{coursePayment}/refund', [PaymentController::class, 'refund'])->name('payments.refund');

        // Refunds: the GET index route already lives in routes/admin.php and
        // points at the same controller; only the actions are added here.
        Route::post('/refunds/{refund}/approve', [AcademyRefundController::class, 'approve'])->name('refunds.approve');
        Route::post('/refunds/{refund}/reject', [AcademyRefundController::class, 'reject'])->name('refunds.reject');
        Route::post('/refunds/{refund}/process', [AcademyRefundController::class, 'process'])->name('refunds.process');

        // Coupons.
        Route::get('/coupons', [CouponController::class, 'index'])->name('coupons.index');
        Route::post('/coupons', [CouponController::class, 'store'])->name('coupons.store');
        Route::put('/coupons/{coupon}', [CouponController::class, 'update'])->name('coupons.update');
        Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->name('coupons.destroy');
        Route::post('/coupons/{coupon}/toggle', [CouponController::class, 'toggle'])->name('coupons.toggle');

        // Payouts: the list is visible to staff (Finance reviews it), but
        // creating and deciding payouts stays admin-only.
        Route::get('/payouts', [PayoutController::class, 'index'])->name('payouts.index');
        Route::middleware('role:admin')->group(function () {
            Route::post('/payouts', [PayoutController::class, 'store'])->name('payouts.store');
            Route::post('/payouts/{payout}/approve', [PayoutController::class, 'approve'])->name('payouts.approve');
            Route::post('/payouts/{payout}/hold', [PayoutController::class, 'hold'])->name('payouts.hold');
            Route::post('/payouts/{payout}/reject', [PayoutController::class, 'reject'])->name('payouts.reject');
        });
    });
});
