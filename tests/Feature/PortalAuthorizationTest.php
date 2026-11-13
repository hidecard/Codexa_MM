<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function verifiedPortalUser(string $role): User
{
    $user = User::factory()->create([
        'email_verified_at' => now(),
        'status' => 'active',
    ]);

    $user->assignRole($role);

    return $user;
}

test('guests are redirected away from every protected portal', function (string $uri) {
    $this->get($uri)->assertRedirect(route('login'));
})->with([
    '/admin/dashboard',
    '/instructor/dashboard',
    '/student/dashboard',
    '/client/dashboard',
]);

test('each portal accepts its assigned role', function (string $role, string $uri, string $component) {
    $this->seed();

    $this->actingAs(verifiedPortalUser($role))
        ->get($uri)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component, false));
})->with([
    ['admin', '/admin/dashboard', 'Admin/Dashboard'],
    ['instructor', '/instructor/dashboard', 'Instructor/Dashboard'],
    ['student', '/student/dashboard', 'Student/Dashboard'],
    ['client', '/client/dashboard', 'Client/Dashboard'],
]);

test('a role cannot access another portal', function (string $role, string $uri) {
    $this->seed();

    $this->actingAs(verifiedPortalUser($role))
        ->get($uri)
        ->assertForbidden();
})->with([
    ['student', '/admin/dashboard'],
    ['client', '/instructor/dashboard'],
    ['instructor', '/client/dashboard'],
    ['admin', '/student/dashboard'],
]);

test('unverified users must verify before entering a portal', function () {
    $this->seed();
    $user = User::factory()->unverified()->create(['status' => 'active']);
    $user->assignRole('student');

    $this->actingAs($user)
        ->get('/student/dashboard')
        ->assertRedirect(route('verification.notice'));
});
