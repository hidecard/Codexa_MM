<?php

namespace App\Policies;

use App\Models\Quotation;
use App\Models\User;

class QuotationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('quotations.view');
    }

    public function view(User $user, Quotation $quotation): bool
    {
        if ($user->hasRole('client')) {
            return $quotation->client->user_id === $user->id;
        }

        if ($user->can('quotations.view')) {
            return true;
        }

        return true; // Admin and staff can view
    }

    public function create(User $user): bool
    {
        return $user->can('quotations.create');
    }

    public function update(User $user, Quotation $quotation): bool
    {
        return $user->can('quotations.update') && $user->hasRole('admin');
    }

    public function delete(User $user, Quotation $quotation): bool
    {
        return $user->can('quotations.delete') && $user->hasRole('admin');
    }

    public function approve(User $user, Quotation $quotation): bool
    {
        if ($user->hasRole('client')) {
            return $quotation->client->user_id === $user->id && $quotation->status === 'sent';
        }

        return $user->can('quotations.approve');
    }

    public function reject(User $user, Quotation $quotation): bool
    {
        if ($user->hasRole('client')) {
            return $quotation->client->user_id === $user->id && $quotation->status === 'sent';
        }

        return $user->can('quotations.reject');
    }
}
