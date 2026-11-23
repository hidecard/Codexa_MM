<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LearningPath extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'level',
        'duration_label',
        'gradient',
        'glyph',
        'outcomes',
        'is_published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'outcomes' => 'array',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /** Courses in the path, in the order the student should take them. */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'learning_path_courses')
            ->withPivot('position')
            ->orderByPivot('position');
    }

    /** Students who chose to follow this path. */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'learning_path_user')->withTimestamps();
    }
}
