<?php

use App\Http\Controllers\Auth\InviteAcceptController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\ConfirmablePasswordController;
use Laravel\Fortify\Http\Controllers\ConfirmedPasswordStatusController;
use Laravel\Fortify\Http\Controllers\ConfirmedTwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController;
use Laravel\Fortify\Http\Controllers\EmailVerificationPromptController;
use Laravel\Fortify\Http\Controllers\NewPasswordController;
use Laravel\Fortify\Http\Controllers\PasswordController;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController;
use Laravel\Fortify\Http\Controllers\ProfileInformationController;
use Laravel\Fortify\Http\Controllers\RecoveryCodeController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController;
use Laravel\Fortify\Http\Controllers\VerifyEmailController;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('/register', [RegisteredUserController::class, 'store']);

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');

    // Staff invitation acceptance. The link is a temporary signed URL
    // (7 days) emailed by StaffController::invite; 'signed' verifies the
    // signature and expiry on both the page and the password submission.
    Route::get('/staff-invite/{user}', [InviteAcceptController::class, 'create'])
        ->middleware('signed')
        ->name('staff.invite.accept');

    Route::post('/staff-invite/{user}', [InviteAcceptController::class, 'store'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('staff.invite.accept.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/email/verify', [EmailVerificationPromptController::class, '__invoke'])
        ->name('verification.notice');

    Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, '__invoke'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('/confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('/confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('/password', [PasswordController::class, 'update'])
        ->name('password.update');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::get('/two-factor-challenge', [TwoFactorAuthenticatedSessionController::class, 'create'])
        ->name('two-factor.login');

    Route::post('/two-factor-challenge', [TwoFactorAuthenticatedSessionController::class, 'store']);
});

Route::middleware(['auth', 'password.confirm'])->group(function () {
    if (Features::enabled(Features::twoFactorAuthentication())) {
        Route::get('/two-factor-authentication', [TwoFactorAuthenticationController::class, 'show'])
            ->name('two-factor.authentication.show');

        Route::post('/two-factor-authentication', [TwoFactorAuthenticationController::class, 'store'])
            ->name('two-factor.authentication.store');

        Route::delete('/two-factor-authentication', [TwoFactorAuthenticationController::class, 'destroy'])
            ->name('two-factor.authentication.destroy');

        Route::get('/two-factor-qr-code', [TwoFactorQrCodeController::class, 'show'])
            ->name('two-factor.qr-code.show');

        Route::get('/two-factor-recovery-codes', [RecoveryCodeController::class, 'index'])
            ->name('two-factor.recovery-codes.index');

        Route::post('/two-factor-recovery-codes', [RecoveryCodeController::class, 'store'])
            ->name('two-factor.recovery-codes.store');
    }

    Route::get('/profile', [ProfileInformationController::class, 'edit'])
        ->name('profile.edit');

    Route::put('/profile', [ProfileInformationController::class, 'update'])
        ->name('profile.update');

    Route::get('/confirmed-password-status', [ConfirmedPasswordStatusController::class, 'show'])
        ->name('password.confirmed');

    Route::post('/confirmed-two-factor-authentication', [ConfirmedTwoFactorAuthenticationController::class, 'store'])
        ->name('two-factor.confirmed');
});
