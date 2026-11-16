<?php

use App\Http\Controllers\Client\DocumentController;
use App\Http\Controllers\Client\FeedbackController;
use App\Http\Controllers\Client\InvoiceController;
use App\Http\Controllers\Client\MilestoneController;
use App\Http\Controllers\Client\ProjectController;
use App\Http\Controllers\Client\QuotationController;
use App\Http\Controllers\Client\SupportController;
use App\Http\Controllers\Client\TaskController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:client'])->prefix('client')->name('client.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Client/Dashboard');
    })->name('dashboard');

    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::post('/projects/{project}/updates', [ProjectController::class, 'addUpdate'])->name('projects.updates.store');

    Route::get('/milestones', [MilestoneController::class, 'index'])->name('milestones.index');
    Route::get('/milestones/{milestone}', [MilestoneController::class, 'show'])->name('milestones.show');

    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');

    Route::get('/quotations', [QuotationController::class, 'index'])->name('quotations.index');
    Route::get('/quotations/{quotation}', [QuotationController::class, 'show'])->name('quotations.show');
    Route::post('/quotations/{quotation}/approve', [QuotationController::class, 'approve'])->name('quotations.approve');
    Route::post('/quotations/{quotation}/reject', [QuotationController::class, 'reject'])->name('quotations.reject');

    Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');

    Route::get('/payments', function () {
        return Inertia::render('Client/Payments/Index');
    })->name('payments.index');

    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');

    Route::get('/support', [SupportController::class, 'index'])->name('support.index');
    Route::post('/support', [SupportController::class, 'store'])->name('support.store');
    Route::get('/support/{ticket}', [SupportController::class, 'show'])->name('support.show');
    Route::post('/support/{ticket}/messages', [SupportController::class, 'addMessage'])->name('support.messages.store');

    Route::get('/feedback', [FeedbackController::class, 'index'])->name('feedback.index');
    Route::get('/feedback/create', [FeedbackController::class, 'create'])->name('feedback.create');
    Route::post('/feedback', [FeedbackController::class, 'store'])->name('feedback.store');

    Route::get('/profile', function () {
        return Inertia::render('Client/Profile');
    })->name('profile');
});
