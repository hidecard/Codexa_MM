<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['milestone_id', 'assigned_to', 'title', 'description', 'status', 'priority', 'due_date'])]
class ProjectTask extends Model
{
    protected function casts(): array
    {
        return [
            'status' => 'string',
            'priority' => 'integer',
            'due_date' => 'date',
        ];
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(ProjectMilestone::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
