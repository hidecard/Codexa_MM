<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('public inertia pages share the canonical site identity', function () {
    $this->get('/about')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('site.name', config('app.name'))
            ->where('site.url', rtrim(config('app.url'), '/')));
});

test('sitemap contains public pages and published content', function () {
    $this->seed();

    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', false)
        ->assertSee(route('home'), false)
        ->assertSee(route('courses.index'), false)
        ->assertSee(route('services.index'), false)
        ->assertSee(route('blog.index'), false);
});

test('robots file protects private portal paths and points crawlers to sitemap', function () {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('Disallow: /admin/')
        ->assertSee('Disallow: /student/')
        ->assertSee('Sitemap: '.url('/sitemap.xml'));
});

test('approved Codexa logo variants are used across indexing and app chrome', function () {
    expect(file_exists(public_path('brand/codexa-mark.svg')))->toBeTrue()
        ->and(file_exists(public_path('brand/codexa-wordmark.svg')))->toBeTrue()
        ->and(file_exists(public_path('brand/codexa-wordmark-dark.svg')))->toBeTrue()
        ->and(file_exists(public_path('favicon.svg')))->toBeTrue();

    expect(file_get_contents(resource_path('js/components/shared/seo-head.tsx')))
        ->toContain("'/brand/codexa-wordmark-dark.svg'");
    expect(file_get_contents(resource_path('views/app.blade.php')))
        ->toContain("asset('favicon.svg')");
    expect(file_get_contents(resource_path('js/components/shared/public-layout.tsx')))
        ->toContain('variant="dark"');
});
