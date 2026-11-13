<?php

use Inertia\Testing\AssertableInertia as Assert;

$pages = [
    ['/', 'Public/Home'],
    ['/about', 'Public/About'],
    ['/contact', 'Public/Contact'],
    ['/faq', 'Public/Faq'],
    ['/privacy-policy', 'Public/PrivacyPolicy'],
    ['/terms', 'Public/Terms'],
    ['/portfolio', 'Public/Portfolio/Index'],
    ['/instructors', 'Public/Instructors/Index'],
    ['/blog', 'Public/Blog/Index'],
    ['/courses/categories', 'Public/Courses/Categories'],
];

test('public marketing pages render', function (string $path, string $component) {
    $this->get($path)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with($pages);
