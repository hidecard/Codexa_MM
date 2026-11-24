<?php

// Admin ops writes: live sessions, integrations/API keys, email campaigns,
// bulk import, system status. Loaded before routes/admin.php and
// routes/academy.php; the duplicate closure sample-data routes there were
// removed at integration.

use App\Http\Controllers\Academy\LiveRoomController;
use App\Http\Controllers\Admin\Academy\ImportController;
use App\Http\Controllers\Admin\Academy\IntegrationController;
use App\Http\Controllers\Admin\Academy\LiveSessionController;
use App\Http\Controllers\Admin\Academy\MarketingController;
use App\Http\Controllers\Admin\Academy\SessionRecordingController;
use App\Http\Controllers\Admin\Academy\SystemController;
use App\Http\Controllers\CampaignTrackingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin.access'])->prefix('admin')->name('admin.')->group(function () {
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

        // Session recordings (URL-based, admin CRUD).
        Route::post('/live-classes/recordings', [SessionRecordingController::class, 'store'])->name('live-classes.recordings.store');
        Route::put('/live-classes/recordings/{recording}', [SessionRecordingController::class, 'update'])->name('live-classes.recordings.update');
        Route::delete('/live-classes/recordings/{recording}', [SessionRecordingController::class, 'destroy'])->name('live-classes.recordings.destroy');

        // Integrations / API keys stay admin-only (secrets).
        Route::middleware('role:admin')->group(function () {
            Route::get('/integrations', [IntegrationController::class, 'index'])->name('integrations.index');
            Route::put('/integrations/settings', [IntegrationController::class, 'updateSettings'])->name('integrations.settings.update');
            Route::post('/integrations/api-keys', [IntegrationController::class, 'store'])->name('integrations.api-keys.store');
            Route::put('/integrations/api-keys/{apiKey}', [IntegrationController::class, 'update'])->name('integrations.api-keys.update');
            Route::delete('/integrations/api-keys/{apiKey}', [IntegrationController::class, 'destroy'])->name('integrations.api-keys.destroy');
            Route::post('/integrations/api-keys/{apiKey}/regenerate', [IntegrationController::class, 'regenerate'])->name('integrations.api-keys.regenerate');
            Route::post('/integrations/api-keys/{apiKey}/revoke', [IntegrationController::class, 'revoke'])->name('integrations.api-keys.revoke');
            Route::post('/integrations/api-keys/{apiKey}/reactivate', [IntegrationController::class, 'reactivate'])->name('integrations.api-keys.reactivate');
        });

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

        // System status (read-only) stays admin-only.
        Route::get('/system', [SystemController::class, 'index'])->name('system.index')->middleware('role:admin');
    });
});

// Instructor live sessions: own sessions (read + start/end only).
Route::middleware(['auth', 'verified', 'role:instructor'])->prefix('instructor')->name('instructor.')->group(function () {
    Route::get('/live-host', [LiveSessionController::class, 'instructorIndex'])->name('live-host.index');
    Route::post('/live-host/{liveSession}/start', [LiveSessionController::class, 'instructorStart'])->name('live-host.start');
    Route::post('/live-host/{liveSession}/end', [LiveSessionController::class, 'instructorEnd'])->name('live-host.end');
    // Host live room: state polling, chat, lowering raised hands.
    Route::get('/live-host/{liveSession}/room', [LiveRoomController::class, 'state'])->name('live-host.room');
    Route::post('/live-host/{liveSession}/chat', [LiveRoomController::class, 'postChat'])->name('live-host.chat');
    Route::post('/live-host/{liveSession}/raise-hands/{raiseHand}/lower', [LiveRoomController::class, 'lowerHandForHost'])->name('live-host.raise-hands.lower');
});

// Student live sessions: list + detail + live room participation.
Route::middleware(['auth', 'verified', 'role:student'])->prefix('student')->name('student.')->group(function () {
    Route::get('/live-classes', [LiveSessionController::class, 'studentIndex'])->name('live-classes.index');
    Route::get('/live-classes/{liveSession}', [LiveSessionController::class, 'studentShow'])->name('live-classes.show');
    Route::get('/live-classes/{liveSession}/room', [LiveRoomController::class, 'state'])->name('live-classes.room');
    Route::post('/live-classes/{liveSession}/join', [LiveRoomController::class, 'join'])->name('live-classes.join');
    Route::post('/live-classes/{liveSession}/leave', [LiveRoomController::class, 'leave'])->name('live-classes.leave');
    Route::post('/live-classes/{liveSession}/chat', [LiveRoomController::class, 'postChat'])->name('live-classes.chat');
    Route::post('/live-classes/{liveSession}/raise-hand', [LiveRoomController::class, 'raiseHand'])->name('live-classes.raise-hand');
    Route::post('/live-classes/{liveSession}/lower-hand', [LiveRoomController::class, 'lowerHand'])->name('live-classes.lower-hand');
    Route::post('/live-classes/{liveSession}/recordings/{recording}/view', [SessionRecordingController::class, 'incrementViews'])->name('live-classes.recordings.view');
});

// Public campaign open/click tracking. URLs are signed per recipient
// (see CampaignTracking::pixelUrl/clickUrl); no auth is possible from an
// email client, so the signature is the authorization.
Route::get('/t/o/{token}', [CampaignTrackingController::class, 'pixel'])->name('tracking.pixel');
Route::get('/t/c/{token}', [CampaignTrackingController::class, 'click'])->name('tracking.click');
