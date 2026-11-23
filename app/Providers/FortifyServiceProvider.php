<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Actions\Fortify\UpdateUserPassword;
use App\Actions\Fortify\UpdateUserProfileInformation;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Custom authentication so login can enforce account status and
        // maintenance mode with clear errors. Bad credentials still return
        // null, which Fortify turns into the standard "auth.failed" error.
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where(Fortify::username(), $request->input(Fortify::username()))->first();

            if (! $user || ! Hash::check((string) $request->input('password'), (string) $user->password)) {
                return null;
            }

            if ($user->status !== 'active') {
                throw ValidationException::withMessages([
                    Fortify::username() => [$user->status === 'suspended'
                        ? 'Your account has been suspended. Please contact Codexa MM support.'
                        : 'Your account is not currently active. Please contact Codexa MM support.'],
                ]);
            }

            if (Setting::getValue('feature_maintenance', false) && ! $user->hasRole('admin')) {
                throw ValidationException::withMessages([
                    Fortify::username() => ['Codexa MM is under maintenance right now. Please try again later.'],
                ]);
            }

            return $user;
        });

        Fortify::createUsersUsing(CreateNewUser::class);
        Fortify::updateUserProfileInformationUsing(UpdateUserProfileInformation::class);
        Fortify::updateUserPasswordsUsing(UpdateUserPassword::class);
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::redirectUserForTwoFactorAuthenticationUsing(RedirectIfTwoFactorAuthenticatable::class);

        Fortify::registerView(function () {
            return inertia('Auth/Register');
        });

        Fortify::loginView(function () {
            return inertia('Auth/Login');
        });

        Fortify::requestPasswordResetLinkView(function () {
            return inertia('Auth/ForgotPassword');
        });

        Fortify::resetPasswordView(function ($request) {
            return inertia('Auth/ResetPassword', ['request' => $request]);
        });

        Fortify::verifyEmailView(function () {
            return inertia('Auth/VerifyEmail');
        });

        Fortify::confirmPasswordView(function () {
            return inertia('Auth/ConfirmPassword');
        });

        Fortify::twoFactorChallengeView(function () {
            return inertia('Auth/TwoFactorChallenge');
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('passkeys', function (Request $request) {
            $credentialId = $request->input('credential.id');

            return Limit::perMinute(10)->by(
                ($credentialId ?: $request->session()->getId()).'|'.$request->ip()
            );
        });
    }
}
