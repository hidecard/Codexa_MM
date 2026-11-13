<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Student/Dashboard');
    })->name('dashboard');

    Route::get('/my-courses', function () {
        return Inertia::render('Student/MyCourses');
    })->name('my-courses');

    Route::get('/courses/{course}/learn', function () {
        return Inertia::render('Student/Course/Learn');
    })->name('courses.learn');

    Route::get('/courses/{course}/lessons/{lesson}', function () {
        return Inertia::render('Student/Course/Lesson');
    })->name('courses.lesson');

    Route::get('/assignments', function () {
        return Inertia::render('Student/Assignments/Index');
    })->name('assignments.index');

    Route::get('/assignments/{assignment}', function () {
        return Inertia::render('Student/Assignments/Show');
    })->name('assignments.show');

    Route::get('/submissions', function () {
        return Inertia::render('Student/Submissions/Index');
    })->name('submissions.index');

    Route::get('/quizzes', function () {
        return Inertia::render('Student/Quizzes/Index');
    })->name('quizzes.index');

    Route::get('/certificates', function () {
        return Inertia::render('Student/Certificates/Index');
    })->name('certificates.index');

    Route::get('/notifications', function () {
        return Inertia::render('Student/Notifications/Index');
    })->name('notifications.index');

    Route::get('/payments', function () {
        return Inertia::render('Student/Payments/Index');
    })->name('payments.index');

    Route::get('/wishlist', function () {
        return Inertia::render('Student/Wishlist');
    })->name('wishlist');

    Route::get('/reviews', function () {
        return Inertia::render('Student/Reviews/Index');
    })->name('reviews.index');

    Route::get('/profile', function () {
        return Inertia::render('Student/Profile');
    })->name('profile');
});

Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Instructor/Dashboard');
    })->name('dashboard');

    Route::get('/courses', function () {
        return Inertia::render('Instructor/Courses/Index');
    })->name('courses.index');

    Route::get('/courses/create', function () {
        return Inertia::render('Instructor/Courses/Create');
    })->name('courses.create');

    Route::get('/courses/{course}/edit', function () {
        return Inertia::render('Instructor/Courses/Edit');
    })->name('courses.edit');

    Route::get('/curriculum', function () {
        return Inertia::render('Instructor/Curriculum/Index');
    })->name('curriculum.index');

    Route::get('/lessons', function () {
        return Inertia::render('Instructor/Lessons/Index');
    })->name('lessons.index');

    Route::get('/resources', function () {
        return Inertia::render('Instructor/Resources/Index');
    })->name('resources.index');

    Route::get('/students', function () {
        return Inertia::render('Instructor/Students/Index');
    })->name('students.index');

    Route::get('/assignments', function () {
        return Inertia::render('Instructor/Assignments/Index');
    })->name('assignments.index');

    Route::get('/submissions', function () {
        return Inertia::render('Instructor/Submissions/Index');
    })->name('submissions.index');

    Route::get('/grading', function () {
        return Inertia::render('Instructor/Grading/Index');
    })->name('grading.index');

    Route::get('/announcements', function () {
        return Inertia::render('Instructor/Announcements/Index');
    })->name('announcements.index');

    Route::get('/reviews', function () {
        return Inertia::render('Instructor/Reviews/Index');
    })->name('reviews.index');

    Route::get('/profile', function () {
        return Inertia::render('Instructor/Profile');
    })->name('profile');
});