<?php

use App\Models\BlogPost;
use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\Faq;
use App\Models\PortfolioProject;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('the public blog returns only published posts and supports search', function () {
    $published = BlogPost::factory()->create(['title' => 'Laravel for teams', 'slug' => 'laravel-for-teams']);
    BlogPost::factory()->create(['title' => 'Draft planning notes', 'status' => 'draft', 'published_at' => null]);

    $this->get('/blog?q=Laravel')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Blog/Index')
            ->where('posts.total', 1)
            ->where('posts.data.0.id', $published->id));
});

test('the portfolio catalog hides drafts and supports search', function () {
    $project = PortfolioProject::factory()->create(['title' => 'School platform', 'slug' => 'school-platform']);
    PortfolioProject::factory()->draft()->create(['title' => 'Internal draft', 'slug' => 'internal-draft']);

    $this->get('/portfolio?q=School')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Portfolio/Index')
            ->where('projects.total', 1)
            ->where('projects.data.0.id', $project->id));
});

test('the instructor directory supports name search and includes co-taught courses', function () {
    $this->seed(RolesAndPermissionsSeeder::class);

    $instructor = User::factory()->create(['name' => 'Laravel Developer', 'status' => 'active']);
    $instructor->assignRole('instructor');
    $coInstructor = User::factory()->create(['name' => 'React Mentor', 'status' => 'active']);
    $coInstructor->assignRole('instructor');
    $category = CourseCategory::query()->create(['name' => 'Web', 'slug' => 'web', 'is_active' => true, 'position' => 1]);
    $course = Course::query()->create([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Shared Course',
        'slug' => 'shared-course',
        'status' => 'published',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 1,
        'price' => 0,
        'pricing_type' => 'free',
        'published_at' => now(),
    ]);
    $course->instructors()->attach($coInstructor->id);
    User::factory()->create(['name' => 'UI Designer', 'status' => 'active'])->assignRole('instructor');

    $this->get('/instructors?q=React')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Instructors/Index')
            ->where('instructors.total', 1)
            ->where('instructors.data.0.id', $coInstructor->id)
            ->where('instructors.data.0.courses_count', 1));

    $this->get('/instructors/'.$coInstructor->id)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Instructors/Show')
            ->where('courses.0.slug', 'shared-course'));
});

test('the FAQ directory hides unpublished entries and supports category search', function () {
    $published = Faq::factory()->create(['question' => 'How do Academy courses work?', 'category' => 'Academy']);
    Faq::factory()->unpublished()->create(['question' => 'Hidden Academy question', 'category' => 'Academy']);

    $this->get('/faq?category=Academy&q=Academy')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Faq')
            ->where('faqs.total', 1)
            ->where('faqs.data.0.id', $published->id)
            ->where('categories.0', 'Academy'));
});
