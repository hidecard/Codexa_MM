<?php

namespace App\Policies;

use App\Models\User;

class PortalPolicy
{
    public function accessStudent(User $user): bool
    {
        return $user->hasRole('student');
    }

    public function accessInstructor(User $user): bool
    {
        return $user->hasRole('instructor');
    }

    public function accessClient(User $user): bool
    {
        return $user->hasRole('client');
    }

    public function accessAdmin(User $user): bool
    {
        return $user->hasRole('admin');
    }
}
