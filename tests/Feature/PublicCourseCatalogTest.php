<?php

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function createCatalogCourse(array $attributes = []): Course
{
    $category = CourseCategory::firstOrCreate(['slug' => 'web-development'], ['name' => 'Web Development', 'is_active' => true]);
    $instructor = User::factory()->create(['name' => 'Instructor']);

    return Course::create(array_merge([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Laravel Foundations',
        'slug' => 'laravel-foundations',
        'short_description' => 'Build a real Laravel application.',
        'description' => 'Learn Laravel by building.',
        'price' => 100000,
        'status' => 'published',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 12,
        'published_at' => now(),
    ], $attributes));
}

test('the public catalog only returns published courses', function () {
    createCatalogCourse();
    createCatalogCourse(['title' => 'Draft Course', 'slug' => 'draft-course', 'status' => 'draft', 'published_at' => null]);

    $this->get('/courses')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Courses/Index')
            ->where('courses.total', 1)
            ->where('courses.data.0.slug', 'laravel-foundations'));
});

test('the public catalog supports search and course detail pages', function () {
    createCatalogCourse();
    createCatalogCourse(['title' => 'JavaScript Basics', 'slug' => 'javascript-basics']);

    $this->get('/courses?q=JavaScript')
        ->assertInertia(fn (Assert $page) => $page->where('courses.total', 1)->where('courses.data.0.slug', 'javascript-basics'));

    $this->get('/courses/laravel-foundations')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Public/Courses/Show')->where('course.slug', 'laravel-foundations'));
});
