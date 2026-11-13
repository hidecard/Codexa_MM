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
            'users.view', 'users.manage', 'roles.view', 'roles.manage',
            'courses.view', 'courses.create', 'courses.update', 'courses.delete',
            'enrollments.view', 'enrollments.manage', 'assignments.manage', 'grades.manage',
            'projects.view-own', 'projects.view-all', 'projects.manage',
            'quotations.view', 'quotations.manage', 'invoices.view', 'invoices.manage',
            'content.manage', 'reports.view', 'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $roles = [
            'admin' => $permissions,
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
