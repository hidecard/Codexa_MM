<?php

use App\Models\Course;
use App\Models\CoursePackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('course pricing supports free, paid, and package offerings', function () {
    $this->seed();

    expect(Course::query()->where('pricing_type', 'paid')->count())->toBe(2)
        ->and(Course::query()->where('pricing_type', 'package')->count())->toBe(1)
        ->and(CoursePackage::query()->published()->firstOrFail()->courses)->toHaveCount(3);

    $packageCourse = Course::query()->where('slug', 'digital-product-design')->firstOrFail();
    $this->get('/courses/'.$packageCourse->slug)
        ->assertInertia(fn (Assert $page) => $page
            ->where('course.pricing_type', 'package')
            ->has('course.packages', 1)
            ->where('course.packages.0.name', 'Codexa Growth Bundle'));
});

test('free course factory can represent zero-cost enrollment', function () {
    $course = Course::factory()->create(['pricing_type' => 'free', 'price' => 0]);

    expect($course->pricing_type)->toBe('free')->and((float) $course->price)->toBe(0.0);
});
