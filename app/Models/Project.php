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
    public const STATUSES = ['inquiry', 'reviewing', 'quoted', 'approved', 'planning', 'in_progress', 'testing', 'client_review', 'completed', 'cancelled', 'on_hold'];

    public const STATUS_TRANSITIONS = [
        'inquiry' => ['reviewing', 'cancelled'],
        'reviewing' => ['quoted', 'cancelled', 'on_hold'],
        'quoted' => ['approved', 'cancelled', 'on_hold'],
        'approved' => ['planning', 'cancelled', 'on_hold'],
        'planning' => ['in_progress', 'cancelled', 'on_hold'],
        'in_progress' => ['testing', 'on_hold', 'cancelled'],
        'testing' => ['client_review', 'in_progress', 'on_hold'],
        'client_review' => ['completed', 'in_progress', 'on_hold'],
        'completed' => ['on_hold'],
        'cancelled' => ['inquiry'],
        'on_hold' => ['in_progress', 'cancelled'],
    ];

    public function canTransitionTo(string $status): bool
    {
        return in_array($status, self::STATUS_TRANSITIONS[$this->status] ?? [], true);
    }

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
        if (! empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function (Builder $project) use ($search) {
                $project->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
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
