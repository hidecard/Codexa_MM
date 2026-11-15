<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login from portal routes', function (string $path) {
    $this->get($path)->assertRedirect(route('login'));
})->with([
    '/student/dashboard',
    '/instructor/dashboard',
    '/client/dashboard',
    '/admin/dashboard',
]);

test('portal routes enforce role access', function (string $role, string $allowed, array $forbidden) {
    $this->seed();
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole($role);

    $this->actingAs($user)->get($allowed)->assertOk();

    foreach ($forbidden as $path) {
        $this->actingAs($user)->get($path)->assertForbidden();
    }
})->with([
    ['student', '/student/dashboard', ['/instructor/dashboard', '/client/dashboard', '/admin/dashboard']],
    ['instructor', '/instructor/dashboard', ['/student/dashboard', '/client/dashboard', '/admin/dashboard']],
    ['client', '/client/dashboard', ['/student/dashboard', '/instructor/dashboard', '/admin/dashboard']],
    ['admin', '/admin/dashboard', ['/student/dashboard', '/instructor/dashboard', '/client/dashboard']],
]);

test('the dashboard route redirects authenticated users to their portal', function (string $role, string $route) {
    $this->seed();
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole($role);

    $this->actingAs($user)->get('/dashboard')->assertRedirect(route($route));
})->with([
    ['student', 'student.dashboard'],
    ['instructor', 'instructor.dashboard'],
    ['client', 'client.dashboard'],
    ['admin', 'admin.dashboard'],
]);

test('authenticated users without a portal role cannot access the dashboard redirect', function () {
    $user = User::factory()->create(['status' => 'active']);

    $this->actingAs($user)->get('/dashboard')->assertForbidden();
});
