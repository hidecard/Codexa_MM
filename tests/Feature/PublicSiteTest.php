<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('the public home page is available', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Home'));
});

test('the health endpoint returns an ok status', function () {
    $this->getJson('/health')
        ->assertOk()
        ->assertJson([
            'status' => 'ok',
            'app' => config('app.name'),
        ]);
});
