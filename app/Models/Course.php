<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['category_id', 'instructor_id', 'title', 'slug', 'description', 'short_description', 'thumbnail', 'price', 'sale_price', 'status', 'level', 'language', 'duration', 'requirements', 'outcomes', 'published_at'])]
class Course extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'duration' => 'integer',
            'requirements' => 'array',
            'outcomes' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->whereHas('category', fn (Builder $category) => $category->where('is_active', true));
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(CourseCategory::class, 'category_id');
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function instructors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_instructors', 'course_id', 'instructor_id');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(CourseModule::class)->orderBy('position');
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(CourseAnnouncement::class)->latest('published_at');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(CourseReview::class);
    }
}
