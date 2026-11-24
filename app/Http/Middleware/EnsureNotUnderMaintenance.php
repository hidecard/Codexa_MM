<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Maintenance-mode enforcement (setting `feature_maintenance`, default off).
 *
 * While maintenance is on, authenticated non-admin users are redirected to
 * the maintenance notice on every request; admins (role `admin`, which
 * super-admins also hold) bypass it. Guests are not redirected — public
 * pages stay readable — but they cannot log in (see the Fortify
 * authenticateUsing callback). The notice page itself and logout are
 * excluded so users can always reach them.
 */
class EnsureNotUnderMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->hasRole('admin')) {
            return $next($request);
        }

        if ($request->routeIs('maintenance') || $request->routeIs('logout')) {
            return $next($request);
        }

        if (Setting::getValue('feature_maintenance', false)) {
            return redirect()->route('maintenance');
        }

        return $next($request);
    }
}
