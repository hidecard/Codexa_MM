<?php

// Admin ops writes: live sessions, integrations/API keys, email campaigns,
// bulk import, system status. Loaded before routes/admin.php and
// routes/academy.php; the duplicate closure sample-data routes there were
// removed at integration.

use App\Http\Controllers\Admin\Academy\ImportController;
use App\Http\Controllers\Admin\Academy\IntegrationController;
use App\Http\Controllers\Admin\Academy\LiveSessionController;
use App\Http\Controllers\Admin\Academy\MarketingController;
use App\Http\Controllers\Admin\Academy\SystemController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::prefix('academy')->name('academy.')->group(function () {
        // Live sessions (admin CRUD + status actions).
        Route::get('/live-classes', [LiveSessionController::class, 'index'])->name('live-classes.index');
        Route::post('/live-classes', [LiveSessionController::class, 'store'])->name('live-classes.store');
        Route::put('/live-classes/{liveSession}', [LiveSessionController::class, 'update'])->name('live-classes.update');
        Route::delete('/live-classes/{liveSession}', [LiveSessionController::class, 'destroy'])->name('live-classes.destroy');
        Route::post('/live-classes/{liveSession}/start', [LiveSessionController::class, 'start'])->name('live-classes.start');
        Route::post('/live-classes/{liveSession}/end', [LiveSessionController::class, 'end'])->name('live-classes.end');
        Route::post('/live-classes/{liveSession}/cancel', [LiveSessionController::class, 'cancel'])->name('live-classes.cancel');
        Route::post('/live-classes/{liveSession}/restore', [LiveSessionController::class, 'restore'])->name('live-classes.restore');

        // Integrations / API keys.
        Route::get('/integrations', [IntegrationController::class, 'index'])->name('integrations.index');
        Route::post('/integrations/api-keys', [IntegrationController::class, 'store'])->name('integrations.api-keys.store');
        Route::put('/integrations/api-keys/{apiKey}', [IntegrationController::class, 'update'])->name('integrations.api-keys.update');
        Route::delete('/integrations/api-keys/{apiKey}', [IntegrationController::class, 'destroy'])->name('integrations.api-keys.destroy');
        Route::post('/integrations/api-keys/{apiKey}/regenerate', [IntegrationController::class, 'regenerate'])->name('integrations.api-keys.regenerate');
        Route::post('/integrations/api-keys/{apiKey}/revoke', [IntegrationController::class, 'revoke'])->name('integrations.api-keys.revoke');
        Route::post('/integrations/api-keys/{apiKey}/reactivate', [IntegrationController::class, 'reactivate'])->name('integrations.api-keys.reactivate');

        // Email campaigns.
        Route::get('/marketing', [MarketingController::class, 'index'])->name('marketing.index');
        Route::post('/marketing/campaigns', [MarketingController::class, 'store'])->name('marketing.campaigns.store');
        Route::put('/marketing/campaigns/{campaign}', [MarketingController::class, 'update'])->name('marketing.campaigns.update');
        Route::delete('/marketing/campaigns/{campaign}', [MarketingController::class, 'destroy'])->name('marketing.campaigns.destroy');
        Route::post('/marketing/campaigns/{campaign}/schedule', [MarketingController::class, 'schedule'])->name('marketing.campaigns.schedule');
        Route::post('/marketing/campaigns/{campaign}/send', [MarketingController::class, 'send'])->name('marketing.campaigns.send');

        // Bulk import (courses only).
        Route::get('/import', [ImportController::class, 'index'])->name('import.index');
        Route::post('/import/preview', [ImportController::class, 'preview'])->name('import.preview');
        Route::post('/import/confirm', [ImportController::class, 'confirm'])->name('import.confirm');

        // System status (read-only).
        Route::get('/system', [SystemController::class, 'index'])->name('system.index');
    });
});

// Instructor live sessions: own sessions (read + start/end only).
Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/live-host', [LiveSessionController::class, 'instructorIndex'])->name('live-host.index');
    Route::post('/live-host/{liveSession}/start', [LiveSessionController::class, 'instructorStart'])->name('live-host.start');
    Route::post('/live-host/{liveSession}/end', [LiveSessionController::class, 'instructorEnd'])->name('live-host.end');
});

// Student live sessions: read-only list of scheduled + live sessions.
Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/live-classes', [LiveSessionController::class, 'studentIndex'])->name('live-classes.index');
    Route::get('/live-classes/{liveSession}', [LiveSessionController::class, 'studentShow'])->name('live-classes.show');
});
