<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['course_id', 'title', 'content', 'published_at'])]
class CourseAnnouncement extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
