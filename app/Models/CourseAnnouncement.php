<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['course_id', 'title', 'content', 'type', 'audience', 'is_pinned', 'published_at'])]
class CourseAnnouncement extends Model
{
    use HasFactory;

    /** Allowed announcement types (student list renders these as pills). */
    public const TYPES = ['general', 'course', 'live', 'promo', 'system'];

    /**
     * Allowed audiences. 'all' (default) = every student enrolled in the
     * course; 'students' = enrolled students; 'instructors' = course
     * instructors only (hidden from the student announcements list).
     */
    public const AUDIENCES = ['all', 'students', 'instructors'];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'is_pinned' => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
