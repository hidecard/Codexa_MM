<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name', 'slug', 'description', 'price', 'sale_price', 'status', 'published_at'])]
class CoursePackage extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'sale_price' => 'decimal:2', 'published_at' => 'datetime'];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->whereNotNull('published_at');
    }

    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_package_courses')->withPivot('position')->orderByPivot('position');
    }
}
