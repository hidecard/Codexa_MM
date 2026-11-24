<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    use HasFactory;

    public const PROVIDERS = ['general', 'youtube', 'zoom', 'payment', 'analytics'];

    protected $fillable = [
        'name',
        'provider',
        'key_value',
        'last_used_at',
        'is_active',
    ];

    /**
     * The full key value is encrypted at rest and hidden from array/JSON
     * output so list responses can never leak it.
     */
    protected $hidden = [
        'key_value',
    ];

    protected function casts(): array
    {
        return [
            'key_value' => 'encrypted',
            'last_used_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * List-safe shape: only the last 4 characters of the key are exposed.
     */
    public function toDisplayArray(): array
    {
        $plain = $this->key_value ?? '';

        return [
            'id' => $this->id,
            'name' => $this->name,
            'provider' => $this->provider,
            'last4' => $plain === '' ? '' : substr($plain, -4),
            'is_active' => $this->is_active,
            'last_used_at' => $this->last_used_at?->toIso8601String(),
            'created' => $this->created_at?->format('Y-m-d') ?? '',
        ];
    }
}
