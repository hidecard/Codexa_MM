<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Permission-based admin-panel access (replaces the strict `role:admin`
 * gate on the /admin route groups).
 *
 * Allowed in:
 * - role `admin` or `super-admin` (super-admins also hold `admin`), or
 * - the `admin.access` permission, which the Support and Finance staff
 *   roles carry.
 *
 * Sensitive areas stay admin-only via an additional `role:admin`
 * middleware on their routes: platform settings, staff management,
 * payout approvals, API-key management, system status, and user/role
 * management.
 *
 * getAllPermissions() is used instead of hasPermissionTo() because the
 * latter throws when the permission row does not exist yet (e.g. a
 * database seeded before `admin.access` was introduced).
 */
class EnsureAdminAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        if ($user->hasAnyRole(['admin', 'super-admin'])) {
            return $next($request);
        }

        if ($user->getAllPermissions()->contains('name', 'admin.access')) {
            return $next($request);
        }

        abort(403);
    }
}
