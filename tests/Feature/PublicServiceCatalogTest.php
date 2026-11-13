<?php

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function createCatalogService(array $attributes = []): Service
{
    $category = ServiceCategory::firstOrCreate(['slug' => 'product-development'], ['name' => 'Product Development', 'is_active' => true]);

    return Service::create(array_merge([
        'category_id' => $category->id,
        'title' => 'Web Platform Development',
        'slug' => 'web-platform-development',
        'short_description' => 'Build a reliable web platform.',
        'description' => 'We build practical digital products.',
        'features' => ['Discovery', 'Engineering'],
        'status' => 'active',
    ], $attributes));
}

test('the public services catalog only returns active services', function () {
    createCatalogService();
    createCatalogService(['title' => 'Archived Service', 'slug' => 'archived-service', 'status' => 'inactive']);

    $this->get('/services')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Services/Index')->where('services.total', 1)->where('services.data.0.slug', 'web-platform-development'));
});

test('the public services catalog supports search and detail pages', function () {
    createCatalogService();
    createCatalogService(['title' => 'System Modernization', 'slug' => 'system-modernization']);

    $this->get('/services?q=System')
        ->assertInertia(fn (Assert $page) => $page->where('services.total', 1)->where('services.data.0.slug', 'system-modernization'));

    $this->get('/services/web-platform-development')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Services/Show')->where('service.slug', 'web-platform-development'));
});
