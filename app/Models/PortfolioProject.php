<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PortfolioProject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title', 'slug', 'description', 'short_description', 'client_name',
        'project_url', 'technologies', 'status', 'position', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'technologies' => 'array',
            'published_at' => 'datetime',
            'position' => 'integer',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->whereNotNull('published_at');
    }

    public function images(): HasMany
    {
        return $this->hasMany(PortfolioImage::class, 'project_id')->orderBy('position');
    }
}
