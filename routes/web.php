<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Public/Home');
})->name('home');

Route::get('/about', function () {
    return Inertia::render('Public/About');
})->name('about');

Route::get('/courses', function () {
    return Inertia::render('Public/Courses/Index');
})->name('courses.index');

Route::get('/courses/categories', function () {
    return Inertia::render('Public/Courses/Categories');
})->name('courses.categories');

Route::get('/courses/{course:slug}', function () {
    return Inertia::render('Public/Courses/Show');
})->name('courses.show');

Route::get('/courses/{course:slug}/curriculum', function () {
    return Inertia::render('Public/Courses/Curriculum');
})->name('courses.curriculum');

Route::get('/services', function () {
    return Inertia::render('Public/Services/Index');
})->name('services.index');

Route::get('/services/{service:slug}', function () {
    return Inertia::render('Public/Services/Show');
})->name('services.show');

Route::get('/portfolio', function () {
    return Inertia::render('Public/Portfolio/Index');
})->name('portfolio.index');

Route::get('/portfolio/{project:slug}', function () {
    return Inertia::render('Public/Portfolio/Show');
})->name('portfolio.show');

Route::get('/instructors', function () {
    return Inertia::render('Public/Instructors/Index');
})->name('instructors.index');

Route::get('/instructors/{instructor:slug}', function () {
    return Inertia::render('Public/Instructors/Show');
})->name('instructors.show');

Route::get('/blog', function () {
    return Inertia::render('Public/Blog/Index');
})->name('blog.index');

Route::get('/blog/{post:slug}', function () {
    return Inertia::render('Public/Blog/Show');
})->name('blog.show');

Route::get('/contact', function () {
    return Inertia::render('Public/Contact');
})->name('contact');

Route::get('/faq', function () {
    return Inertia::render('Public/Faq');
})->name('faq');

Route::get('/privacy-policy', function () {
    return Inertia::render('Public/PrivacyPolicy');
})->name('privacy-policy');

Route::get('/terms', function () {
    return Inertia::render('Public/Terms');
})->name('terms');

require __DIR__.'/health.php';
require __DIR__.'/auth.php';
require __DIR__.'/academy.php';
require __DIR__.'/solutions.php';
require __DIR__.'/admin.php';
