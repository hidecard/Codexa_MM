<?php

namespace App\Policies;

use App\Models\SupportTicket;
use App\Models\User;

class SupportTicketPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tickets.view');
    }

    public function view(User $user, SupportTicket $ticket): bool
    {
        if ($user->can('tickets.view')) {
            return true;
        }

        if ($user->hasRole('client')) {
            return $ticket->client_id === $user->id;
        }

        return true; // Admin and staff can view
    }

    public function create(User $user): bool
    {
        return $user->can('tickets.create');
    }

    public function update(User $user, SupportTicket $ticket): bool
    {
        if ($user->can('tickets.update') && $user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('client')) {
            return $ticket->client_id === $user->id;
        }

        return true; // Staff can update
    }

    public function delete(User $user, SupportTicket $ticket): bool
    {
        return $user->can('tickets.delete') && $user->hasRole('admin');
    }
}
