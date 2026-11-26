<?php

// Admin ops writes: integrations/API keys, email campaigns,
// bulk import, system status.

use App\Http\Controllers\Admin\Academy\ImportController;
use App\Http\Controllers\Admin\Academy\IntegrationController;
use App\Http\Controllers\Admin\Academy\MarketingController;
use App\Http\Controllers\Admin\Academy\SystemController;
use App\Http\Controllers\CampaignTrackingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin.access'])->prefix('admin')->name('admin.')->group(function () {
    Route::prefix('academy')->name('academy.')->group(function () {
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

// Public campaign open/click tracking. URLs are signed per recipient
// (see CampaignTracking::pixelUrl/clickUrl); no auth is possible from an
// email client, so the signature is the authorization.
Route::get('/t/o/{token}', [CampaignTrackingController::class, 'pixel'])->name('tracking.pixel');
Route::get('/t/c/{token}', [CampaignTrackingController::class, 'click'])->name('tracking.click');