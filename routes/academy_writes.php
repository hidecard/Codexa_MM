<?php

// Instructor + student writes: instructor announcements, Q&A answers,
// review replies, instructor profile, payout requests; student reviews,
// notes, refund requests, checkout/orders. Loaded before routes/academy.php;
// the duplicate closure routes there were removed at integration.

use App\Http\Controllers\Instructor\AnnouncementController as InstructorAnnouncementController;
use App\Http\Controllers\Instructor\PayoutController as InstructorPayoutController;
use App\Http\Controllers\Instructor\ProfileController as InstructorProfileController;
use App\Http\Controllers\Instructor\QaController as InstructorQaController;
use App\Http\Controllers\Instructor\ReviewReplyController as InstructorReviewReplyController;
use App\Http\Controllers\Student\CommunityPostController as StudentCommunityPostController;
use App\Http\Controllers\Student\NoteController as StudentNoteController;
use App\Http\Controllers\Student\OrderController as StudentOrderController;
use App\Http\Controllers\Student\QuestionController as StudentQuestionController;
use App\Http\Controllers\Student\RefundRequestController as StudentRefundRequestController;
use App\Http\Controllers\Student\ReviewController as StudentReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/announcements', [InstructorAnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements', [InstructorAnnouncementController::class, 'store'])->name('announcements.store');
    Route::put('/announcements/{announcement}', [InstructorAnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement}', [InstructorAnnouncementController::class, 'destroy'])->name('announcements.destroy');
    Route::post('/announcements/{announcement}/publish', [InstructorAnnouncementController::class, 'publish'])->name('announcements.publish');
    Route::post('/announcements/{announcement}/unpublish', [InstructorAnnouncementController::class, 'unpublish'])->name('announcements.unpublish');

    Route::get('/qa', [InstructorQaController::class, 'index'])->name('qa.index');
    Route::post('/qa/{question}/answer', [InstructorQaController::class, 'answer'])->name('qa.answer');

    Route::get('/reviews', [InstructorReviewReplyController::class, 'index'])->name('reviews.index');
    Route::post('/reviews/{review}/reply', [InstructorReviewReplyController::class, 'reply'])->name('reviews.reply');

    Route::get('/profile', [InstructorProfileController::class, 'show'])->name('profile');
    Route::put('/profile', [InstructorProfileController::class, 'update'])->name('profile.update');

    Route::get('/earnings', [InstructorPayoutController::class, 'index'])->name('earnings.index');
    Route::post('/payouts', [InstructorPayoutController::class, 'store'])->name('payouts.store');
});

Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::post('/reviews', [StudentReviewController::class, 'store'])->name('reviews.store');

    Route::post('/questions', [StudentQuestionController::class, 'store'])->name('questions.store');
    Route::post('/reviews/{review}/report', [StudentReviewController::class, 'report'])->name('reviews.report');

    Route::post('/community', [StudentCommunityPostController::class, 'store'])->name('community.store');
    Route::put('/community/{post}', [StudentCommunityPostController::class, 'update'])->name('community.update');
    Route::delete('/community/{post}', [StudentCommunityPostController::class, 'destroy'])->name('community.destroy');

    Route::get('/notes', [StudentNoteController::class, 'index'])->name('notes.index');
    Route::post('/notes', [StudentNoteController::class, 'store'])->name('notes.store');
    Route::put('/notes/{note}', [StudentNoteController::class, 'update'])->name('notes.update');
    Route::delete('/notes/{note}', [StudentNoteController::class, 'destroy'])->name('notes.destroy');

    Route::get('/refunds', [StudentRefundRequestController::class, 'index'])->name('refunds.index');
    Route::post('/refunds', [StudentRefundRequestController::class, 'store'])->name('refunds.store');

    Route::get('/cart', [StudentOrderController::class, 'cart'])->name('cart.index');
    Route::post('/cart', [StudentOrderController::class, 'addToCart'])->name('cart.store');
    Route::delete('/cart/{course}', [StudentOrderController::class, 'removeFromCart'])->name('cart.destroy');
    Route::get('/checkout', [StudentOrderController::class, 'checkout'])->name('checkout.index');
    Route::get('/coupons/validate', [StudentOrderController::class, 'validateCoupon'])->name('coupons.validate');
    Route::post('/orders', [StudentOrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [StudentOrderController::class, 'index'])->name('orders.index');
});
