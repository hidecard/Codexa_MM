<?php

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(UserSeeder::class);
});

function resetStudent(): User
{
    return User::query()->where('email', 'student@codexamm.test')->firstOrFail();
}

test('the password reset page renders with the token and email', function () {
    $user = resetStudent();
    $token = Password::broker()->createToken($user);

    $this->get('/reset-password/'.$token.'?email='.urlencode($user->email))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Auth/ResetPassword')
            ->where('email', $user->email)
            ->where('token', $token)
        );
});

test('resetting with a valid token updates the password and the new password logs in', function () {
    $user = resetStudent();
    $token = Password::broker()->createToken($user);

    // A successful reset redirects home (Fortify's PasswordResetResponse);
    // this Fortify version does not log the user in during the reset.
    $this->post('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ])->assertRedirect(config('fortify.home'));

    $this->assertGuest();

    expect(Hash::check('new-secure-password', $user->fresh()->password))->toBeTrue()
        ->and(Hash::check('password', $user->fresh()->password))->toBeFalse();

    // Prove the new password works at the login form.
    $this->post('/login', [
        'email' => $user->email,
        'password' => 'new-secure-password',
    ]);

    $this->assertAuthenticatedAs($user);
});

test('resetting with an invalid token fails and leaves the password unchanged', function () {
    $user = resetStudent();
    $originalHash = $user->password;

    $this->post('/reset-password', [
        'token' => 'not-a-real-token',
        'email' => $user->email,
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ])->assertSessionHasErrors('email');

    expect($user->fresh()->password)->toBe($originalHash);
});

test('resetting with mismatched password confirmation fails', function () {
    $user = resetStudent();
    $token = Password::broker()->createToken($user);
    $originalHash = $user->password;

    $this->post('/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-secure-password',
        'password_confirmation' => 'something-else',
    ])->assertSessionHasErrors('password');

    expect($user->fresh()->password)->toBe($originalHash);
});
