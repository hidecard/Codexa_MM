<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@codexamm.test',
                'role' => 'admin',
                'profile' => ['phone' => '09-000000001', 'bio' => 'Platform administrator for Codexa MM.'],
            ],
            [
                'name' => 'Instructor User',
                'email' => 'instructor@codexamm.test',
                'role' => 'instructor',
                'profile' => ['phone' => '09-000000002', 'bio' => 'Instructor account for academy courses.'],
            ],
            [
                'name' => 'Client User',
                'email' => 'client@codexamm.test',
                'role' => 'client',
                'profile' => ['phone' => '09-000000003', 'bio' => 'Client account for Codexa Solutions projects.'],
            ],
            [
                'name' => 'Student User',
                'email' => 'student@codexamm.test',
                'role' => 'student',
                'profile' => ['phone' => '09-000000004', 'bio' => 'Student account for Codexa Academy learning.'],
            ],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'role' => 'student',
                'profile' => ['phone' => null, 'bio' => 'Default seeded test student account.'],
            ],
        ];

        foreach ($users as $data) {
            $user = User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'status' => 'active',
                ],
            );

            $user->syncRoles([$data['role']]);

            Profile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'phone' => $data['profile']['phone'] ?? null,
                    'bio' => $data['profile']['bio'] ?? null,
                    'avatar' => null,
                    'address' => null,
                ],
            );

            UserPreference::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'locale' => 'en',
                    'theme' => 'light',
                ],
            );
        }
    }
}
