<?php

use Inertia\Testing\AssertableInertia as Assert;

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
