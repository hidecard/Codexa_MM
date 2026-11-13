<?php

namespace App\Policies;

use App\Models\User;

class PortalPolicy
{
    public function admin(User $user): bool
    {
        return $user->hasRole('admin');
    }

    public function instructor(User $user): bool
    {
        return $user->hasRole('instructor');
    }

    public function student(User $user): bool
    {
        return $user->hasRole('student');
    }

    public function client(User $user): bool
    {
        return $user->hasRole('client');
    }
}
