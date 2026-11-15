<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;

class ClientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('clients.view');
    }

    public function view(User $user, Client $client): bool
    {
        if ($user->can('clients.view')) {
            return true;
        }

        return $user->hasRole('client') && $client->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('clients.create');
    }

    public function update(User $user, Client $client): bool
    {
        return $user->can('clients.update') && ($user->hasRole('admin') || $client->user_id === $user->id);
    }

    public function delete(User $user, Client $client): bool
    {
        return $user->can('clients.delete') && $user->hasRole('admin');
    }
}
