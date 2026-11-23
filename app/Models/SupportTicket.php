<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['client_id', 'project_id', 'subject', 'status', 'priority'])]
class SupportTicket extends Model
{
    protected function casts(): array
    {
        return ['status' => 'string', 'priority' => 'integer'];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function messages(): HasMany
    {
        // ticket_messages uses ticket_id, not the guessed support_ticket_id.
        return $this->hasMany(SupportTicketMessage::class, 'ticket_id')->orderBy('created_at');
    }
}
