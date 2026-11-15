<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('invoices.view');
    }

    public function view(User $user, Invoice $invoice): bool
    {
        if ($user->can('invoices.view')) {
            return true;
        }

        if ($user->hasRole('client')) {
            return $invoice->client->user_id === $user->id;
        }

        return true; // Admin and staff can view
    }

    public function create(User $user): bool
    {
        return $user->can('invoices.create');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->can('invoices.update') && $user->hasRole('admin');
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->can('invoices.delete') && $user->hasRole('admin');
    }

    public function pay(User $user, Invoice $invoice): bool
    {
        if ($user->hasRole('client')) {
            return $invoice->client->user_id === $user->id && in_array($invoice->status, ['sent', 'partial', 'overdue']);
        }

        return $user->can('invoices.pay');
    }
}
