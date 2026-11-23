<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class StaffController extends Controller
{
    /**
     * Display labels shown in the UI mapped to Spatie role slugs.
     * 'super-admin', 'support' and 'finance' are not part of the base
     * seeder; they are created on demand when first assigned.
     */
    private const ROLE_MAP = [
        'Super Admin' => 'super-admin',
        'Admin' => 'admin',
        'Support' => 'support',
        'Finance' => 'finance',
        'Instructor' => 'instructor',
    ];

    /** Priority order when a user holds several staff roles. */
    private const DISPLAY_PRIORITY = ['super-admin', 'admin', 'finance', 'support', 'instructor'];

    private const AVATAR_COLORS = ['#0ea892', '#ec4899', '#38bdf8', '#22c55e', '#6366f1', '#f59e0b', '#8b5cf6', '#ef4444'];

    public function index(): Response
    {
        // Spatie's role() scope throws RoleDoesNotExist for roles that do
        // not exist yet, so make sure the staff roles are present first.
        static::ensureStaffRoles();

        $staff = User::role(array_values(static::ROLE_MAP))
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'init' => static::initials($user->name),
                'col' => static::AVATAR_COLORS[$user->id % count(static::AVATAR_COLORS)],
                'email' => $user->email,
                'role' => static::displayRole($user),
                'status' => $user->status ?? 'active',
            ])->values();

        return Inertia::render('Admin/Academy/Staff/Index', [
            'staff' => $staff,
        ]);
    }

    /**
     * Invite a staff member. The account is created active with a random
     * password; NO invitation email is sent (no invite mail flow exists),
     * so the invited person must use password reset to sign in.
     */
    public function invite(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', 'in:Super Admin,Admin,Support,Finance'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Str::random(16),
            'status' => 'active',
        ]);

        // email_verified_at is not mass-assignable on User, so set it
        // directly: the invited account must pass the 'verified' middleware.
        $user->email_verified_at = now();
        $user->save();

        $user->syncRoles(static::rolesFor($validated['role']));

        return redirect()->back()->with('success', 'Staff account created. No invitation email was sent — the new member must reset their password to sign in.');
    }

    public function changeRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'in:Super Admin,Admin,Support,Finance,Instructor'],
        ]);

        // Safety: never let an admin remove their own admin role.
        if ($user->id === $request->user()->id && ! in_array($validated['role'], ['Super Admin', 'Admin'], true)) {
            return redirect()->back()->withErrors(['role' => 'You cannot remove your own admin role.']);
        }

        $user->syncRoles(static::rolesFor($validated['role']));

        return redirect()->back()->with('success', 'Role updated.');
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        // Safety: never let an admin deactivate their own account.
        if ($user->id === $request->user()->id && $validated['status'] === 'inactive') {
            return redirect()->back()->withErrors(['status' => 'You cannot deactivate your own account.']);
        }

        $user->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Staff status updated.');
    }

    /**
     * Make sure every staff role exists. 'super-admin', 'support' and
     * 'finance' are not part of the base seeder.
     */
    private static function ensureStaffRoles(): void
    {
        foreach (array_values(static::ROLE_MAP) as $slug) {
            Role::findOrCreate($slug, 'web');
        }
    }

    /**
     * Spatie roles for a display label. Super Admin keeps the base 'admin'
     * role as well, because the admin panel routes require role:admin.
     */
    private static function rolesFor(string $label): array
    {
        $slug = static::ROLE_MAP[$label];
        Role::findOrCreate($slug, 'web');

        return $slug === 'super-admin' ? ['super-admin', 'admin'] : [$slug];
    }

    private static function displayRole(User $user): string
    {
        $names = $user->getRoleNames()->all();

        foreach (static::DISPLAY_PRIORITY as $slug) {
            if (in_array($slug, $names, true)) {
                return array_search($slug, static::ROLE_MAP, true);
            }
        }

        return 'Admin';
    }

    private static function initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];

        return strtoupper(implode('', array_map(
            fn ($word) => mb_substr($word, 0, 1),
            array_slice($parts, 0, 2),
        )));
    }
}
