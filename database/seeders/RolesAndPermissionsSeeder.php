<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Admin-panel entry: admins pass by role; Support/Finance staff
            // pass by this permission (EnsureAdminAccess middleware).
            'admin.access',
            'users.view', 'users.manage', 'roles.view', 'roles.manage',
            'courses.view', 'courses.create', 'courses.update', 'courses.delete',
            'enrollments.view', 'enrollments.manage', 'assignments.manage', 'grades.manage',
            'projects.view-own', 'projects.view-all', 'projects.manage',
            'quotations.view', 'quotations.manage', 'invoices.view', 'invoices.manage',
            'tickets.view', 'tickets.create', 'tickets.update', 'tickets.delete',
            'content.manage', 'reports.view', 'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $roles = [
            'admin' => $permissions,
            // Staff roles: admin-panel access via `admin.access`; sensitive
            // areas (settings, staff, payout approvals, API keys, system,
            // user/role management) stay `role:admin` on their routes.
            'support' => [
                'admin.access', 'users.view', 'enrollments.view',
                'tickets.view', 'tickets.update',
                'content.manage', 'reports.view',
            ],
            'finance' => [
                'admin.access', 'invoices.view', 'reports.view', 'enrollments.view',
            ],
            'instructor' => [
                'courses.view', 'courses.create', 'courses.update',
                'enrollments.view', 'assignments.manage', 'grades.manage',
            ],
            'student' => [
                'courses.view', 'enrollments.view', 'projects.view-own',
                'quotations.view', 'invoices.view',
            ],
            'client' => [
                'projects.view-own', 'quotations.view', 'invoices.view',
            ],
        ];

        foreach ($roles as $name => $rolePermissions) {
            $role = Role::findOrCreate($name, 'web');
            $role->syncPermissions($rolePermissions);
        }
    }
}
