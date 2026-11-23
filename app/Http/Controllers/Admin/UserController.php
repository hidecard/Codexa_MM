<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AcademyAnalytics;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $role = (string) $request->query('role', 'all');

        $users = User::query()
            ->with('roles:id,name')
            ->when($search !== '', fn ($q) => $q->where(fn ($qq) => $qq
                ->where('name', 'like', '%'.$search.'%')
                ->orWhere('email', 'like', '%'.$search.'%')))
            ->when($role !== 'all' && Role::query()->where('name', $role)->exists(), fn ($q) => $q->role($role))
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status ?? 'active',
                'roles' => $user->roles->pluck('name')->values()->all(),
                'init' => AcademyAnalytics::initials($user->name),
                'col' => AcademyAnalytics::avatarColor($user->id),
                'created_at' => optional($user->created_at)?->toDateString(),
                'verified' => $user->email_verified_at !== null,
            ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => Role::query()->orderBy('name')->pluck('name')->values()->all(),
            'filters' => ['search' => $search, 'role' => $role],
        ]);
    }

    public function roles(): Response
    {
        $roles = Role::query()
            ->with('permissions:id,name')
            ->withCount('users')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'users_count' => $role->users_count,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ])->values();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
        ]);
    }

    public function updateRoles(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', Rule::exists('roles', 'name')],
        ]);

        // An admin must not lock themselves out of the admin area.
        if ($user->is($request->user()) && ! in_array('admin', $validated['roles'], true)) {
            return back()->withErrors(['roles' => 'ကိုယ့်အကောင့်ကနေ admin role ကို ဖယ်ရှားလို့ မရပါ။']);
        }

        $user->syncRoles($validated['roles']);

        return back()->with('success', $user->name.' ၏ role များကို ပြင်ဆင်ပြီးပါပြီ');
    }

    public function permissions(): Response
    {
        $permissions = Permission::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->groupBy(fn (Permission $permission) => str_contains($permission->name, '.')
                ? Str::before($permission->name, '.')
                : 'other')
            ->map(fn ($group) => $group->map(fn (Permission $permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
            ])->values()->all())
            ->sortKeys()
            ->all();

        $roles = Role::query()
            ->with('permissions:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ])->values();

        return Inertia::render('Admin/Permissions/Index', [
            'groups' => $permissions,
            'roles' => $roles,
        ]);
    }

    public function updateRolePermissions(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')],
        ]);

        // The admin roles must keep admin.access so /admin stays reachable.
        if (in_array($role->name, ['admin', 'super-admin'], true)
            && ! in_array('admin.access', $validated['permissions'], true)) {
            return back()->withErrors(['permissions' => 'admin role မှာ admin.access permission ရှိရပါမယ်။']);
        }

        $role->syncPermissions($validated['permissions']);

        return back()->with('success', $role->name.' role ၏ permission များကို ပြင်ဆင်ပြီးပါပြီ');
    }
}
