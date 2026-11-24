<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['project_id', 'title', 'description', 'start_date', 'due_date', 'status', 'completion_percentage'])]
class ProjectMilestone extends Model
{
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'due_date' => 'date',
            'status' => 'string',
            'completion_percentage' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class, 'milestone_id')->orderBy('id');
    }
}
