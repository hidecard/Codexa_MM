<?php

use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\PortfolioProject;
use App\Models\User;
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

test('the instructor directory supports name search and only shows instructors', function () {
    $this->seed();
    $instructor = User::factory()->create(['name' => 'Mya Developer']);
    $instructor->assignRole('instructor');
    $student = User::factory()->create(['name' => 'Mya Student']);
    $student->assignRole('student');

    $this->get('/instructors?q=Developer')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Instructors/Index')
            ->where('instructors.total', 1)
            ->where('instructors.data.0.id', $instructor->id));
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
