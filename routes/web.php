<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\PublicBlogController;
use App\Http\Controllers\PublicCourseController;
use App\Http\Controllers\PublicFaqController;
use App\Http\Controllers\PublicInstructorController;
use App\Http\Controllers\PublicPortfolioController;
use App\Http\Controllers\PublicServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Public/Home');
})->name('home');

Route::get('/dashboard', function () {
    $user = request()->user();

    return match (true) {
        $user->hasRole('admin') => redirect()->route('admin.dashboard'),
        $user->hasRole('instructor') => redirect()->route('instructor.dashboard'),
        $user->hasRole('client') => redirect()->route('client.dashboard'),
        $user->hasRole('student') => redirect()->route('student.dashboard'),
        default => abort(403, 'No portal role is assigned to this account.'),
    };
})->middleware('auth')->name('dashboard');

Route::get('/about', function () {
    return Inertia::render('Public/About');
})->name('about');

Route::get('/courses', [PublicCourseController::class, 'index'])->name('courses.index');

Route::get('/courses/categories', function () {
    return Inertia::render('Public/Courses/Categories');
})->name('courses.categories');

Route::get('/courses/{course:slug}', [PublicCourseController::class, 'show'])->name('courses.show');

Route::get('/courses/{course:slug}/curriculum', function () {
    return Inertia::render('Public/Courses/Curriculum');
})->name('courses.curriculum');

Route::get('/services', [PublicServiceController::class, 'index'])->name('services.index');

Route::get('/services/{service:slug}', [PublicServiceController::class, 'show'])->name('services.show');

Route::get('/portfolio', [PublicPortfolioController::class, 'index'])->name('portfolio.index');

Route::get('/portfolio/{project:slug}', [PublicPortfolioController::class, 'show'])->name('portfolio.show');

Route::get('/instructors', [PublicInstructorController::class, 'index'])->name('instructors.index');

Route::get('/instructors/{instructor}', [PublicInstructorController::class, 'show'])->name('instructors.show');

Route::get('/blog', [PublicBlogController::class, 'index'])->name('blog.index');

Route::get('/blog/{post:slug}', [PublicBlogController::class, 'show'])->name('blog.show');

Route::get('/contact', function () {
    return Inertia::render('Public/Contact');
})->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:10,1')->name('contact.store');

Route::get('/faq', PublicFaqController::class)->name('faq');

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
