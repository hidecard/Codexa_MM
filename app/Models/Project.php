<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['client_id', 'title', 'description', 'status', 'start_date', 'due_date', 'budget'])]
class Project extends Model
{
    protected function casts(): array
    {
        return [
            'status' => 'string',
            'start_date' => 'date',
            'due_date' => 'date',
            'budget' => 'decimal:2',
        ];
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['client_id']) && $filters['client_id'] !== 'all') {
            $query->where('client_id', $filters['client_id']);
        }

        return $query;
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class)->orderBy('start_date');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class)->latest();
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ProjectUpdate::class)->latest();
    }

    public function supportTickets(): HasMany
    {
        return $this->hasMany(SupportTicket::class);
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
