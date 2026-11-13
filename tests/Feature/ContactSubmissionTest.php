<?php

use App\Models\ContactMessage;
use App\Models\User;
use App\Notifications\ContactMessageReceived;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

beforeEach(fn () => $this->withoutMiddleware(PreventRequestForgery::class));

function validContactPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Aye Aye',
        'email' => 'aye@example.com',
        'phone' => '0912345678',
        'subject' => 'Course inquiry',
        'message' => 'I would like to learn more about the next course intake.',
    ], $overrides);
}

test('a valid contact inquiry is persisted and notifies admins through the queue', function () {
    $this->seed();
    Notification::fake();
    $admin = User::query()->role('admin')->firstOrFail();

    $this->from('/contact')
        ->post('/contact', validContactPayload())
        ->assertRedirect('/contact')
        ->assertSessionHas('success');

    $message = ContactMessage::query()->firstOrFail();
    expect($message->only(array_keys(validContactPayload())))
        ->toMatchArray(validContactPayload());
    Notification::assertSentTo($admin, ContactMessageReceived::class, fn ($notification) => $notification->contactMessage->is($message));
});

test('the contact honeypot rejects automated submissions without persisting them', function () {
    $this->seed();

    $this->from('/contact')
        ->post('/contact', validContactPayload(['website' => 'https://spam.example']))
        ->assertSessionHasErrors('website');

    expect(ContactMessage::query()->count())->toBe(0);
});

test('contact validation rejects incomplete or malformed submissions', function (string $field, mixed $value) {
    $this->post('/contact', validContactPayload([$field => $value]))
        ->assertSessionHasErrors($field);
})->with([
    ['name', ''],
    ['email', 'not-an-email'],
    ['subject', ''],
    ['message', ''],
]);

test('contact submissions are rate limited', function () {
    $this->seed();
    Notification::fake();

    for ($i = 0; $i < 10; $i++) {
        $this->post('/contact', validContactPayload(['email' => "aye{$i}@example.com"]))->assertRedirect();
    }

    $this->post('/contact', validContactPayload(['email' => 'blocked@example.com']))
        ->assertTooManyRequests();
});
