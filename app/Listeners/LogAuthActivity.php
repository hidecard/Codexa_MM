<?php

namespace App\Listeners;

use App\Support\ActivityLog;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;

/**
 * Logs sign-ins and sign-outs to system_logs. Registered in
 * AppServiceProvider so no Fortify controller needs editing.
 */
class LogAuthActivity
{
    public function handleLogin(Login $event): void
    {
        ActivityLog::record('auth.login', 'Logged in', actor: $event->user);
    }

    public function handleLogout(Logout $event): void
    {
        ActivityLog::record('auth.logout', 'Logged out', actor: $event->user);
    }
}
