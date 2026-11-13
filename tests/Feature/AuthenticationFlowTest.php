<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('the login and registration pages render through Inertia', function () {
    $this->get('/login')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));

    $this->get('/register')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Auth/Register'));
});

test('a student is sent to the student portal dashboard', function () {
    $this->seed();
    $user = User::factory()->create(['status' => 'active']);
    $user->assignRole('student');

    $this->actingAs($user)->get('/dashboard')->assertRedirect(route('student.dashboard'));
});

test('an inactive account is signed out before accessing a protected page', function () {
    $user = User::factory()->create(['status' => 'suspended']);

    $this->actingAs($user)->get('/dashboard')
        ->assertRedirect(route('login'))
        ->assertSessionHasErrors('email');
});
