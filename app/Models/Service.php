<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['category_id', 'title', 'slug', 'description', 'short_description', 'icon', 'features', 'status'])]
class Service extends Model
{
    protected function casts(): array
    {
        return ['features' => 'array'];
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('status', 'active')
            ->whereHas('category', fn (Builder $category) => $category->where('is_active', true));
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }
}
