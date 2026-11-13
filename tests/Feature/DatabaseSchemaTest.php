<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('the core public content tables have complete columns', function () {
    expect(Schema::hasColumns('faqs', ['question', 'answer', 'is_published', 'sort_order']))->toBeTrue()
        ->and(Schema::hasColumns('system_logs', ['level', 'event', 'message', 'context', 'request_id']))->toBeTrue()
        ->and(Schema::hasColumns('blog_categories', ['name', 'slug']))->toBeTrue()
        ->and(Schema::hasColumns('certificate_templates', ['name', 'design_config']))->toBeTrue();
});

test('relationship tables enforce one-to-one and lookup constraints', function () {
    $indexes = collect(Schema::getIndexes('profiles'))->pluck('columns')->map(fn (array $columns) => implode(',', $columns));
    $notificationIndexes = collect(Schema::getIndexes('notifications'))->pluck('columns')->map(fn (array $columns) => implode(',', $columns));

    expect($indexes)->toContain('user_id')
        ->and($notificationIndexes)->toContain('user_id,is_read');
});
