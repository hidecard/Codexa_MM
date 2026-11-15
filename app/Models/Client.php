<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'company_name', 'company_email', 'company_phone', 'company_address', 'tax_id', 'status'])]
class Client extends Model
{
    protected function casts(): array
    {
        return ['status' => 'string'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class, 'client_id');
    }

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class, 'client_id');
    }
}
