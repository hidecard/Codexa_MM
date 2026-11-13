<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:client'])->prefix('client')->name('client.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Client/Dashboard');
    })->name('dashboard');

    Route::get('/projects', function () {
        return Inertia::render('Client/Projects/Index');
    })->name('projects.index');

    Route::get('/projects/{project}', function () {
        return Inertia::render('Client/Projects/Show');
    })->name('projects.show');

    Route::get('/milestones', function () {
        return Inertia::render('Client/Milestones/Index');
    })->name('milestones.index');

    Route::get('/tasks', function () {
        return Inertia::render('Client/Tasks/Index');
    })->name('tasks.index');

    Route::get('/quotations', function () {
        return Inertia::render('Client/Quotations/Index');
    })->name('quotations.index');

    Route::get('/invoices', function () {
        return Inertia::render('Client/Invoices/Index');
    })->name('invoices.index');

    Route::get('/payments', function () {
        return Inertia::render('Client/Payments/Index');
    })->name('payments.index');

    Route::get('/documents', function () {
        return Inertia::render('Client/Documents/Index');
    })->name('documents.index');

    Route::get('/support', function () {
        return Inertia::render('Client/Support/Index');
    })->name('support.index');

    Route::get('/feedback', function () {
        return Inertia::render('Client/Feedback/Index');
    })->name('feedback.index');

    Route::get('/profile', function () {
        return Inertia::render('Client/Profile');
    })->name('profile');
});