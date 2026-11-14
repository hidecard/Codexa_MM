<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['module_id', 'title', 'content', 'video_url', 'duration', 'position', 'type', 'is_free', 'meta'])]
class Lesson extends Model
{
    use HasFactory;

    protected $hidden = ['video_url', 'meta'];

    protected function casts(): array
    {
        return ['duration' => 'integer', 'position' => 'integer', 'is_free' => 'boolean', 'meta' => 'array'];
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class, 'module_id');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(LessonResource::class);
    }
}
