<?php

use App\Actions\Fortify\CreateNewUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('the standard seeder creates the four portal roles plus staff roles', function () {
    $this->seed();

    // Four portal roles plus the Support/Finance staff roles, which enter
    // the admin panel via the `admin.access` permission.
    expect(Role::pluck('name')->sort()->values()->all())
        ->toBe(['admin', 'client', 'finance', 'instructor', 'student', 'support']);
});

test('public registration assigns only the student role', function () {
    $this->seed();

    $user = app(CreateNewUser::class)->create([
        'name' => 'New Student',
        'email' => 'student@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    expect($user->hasRole('student'))->toBeTrue()
        ->and($user->hasAnyRole(['admin', 'instructor', 'client']))->toBeFalse();
});
