<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'amount',
        'method',
        'status',
        'period',
        'paid_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /** Display code shown in the admin UI, e.g. PAY-014. */
    public function displayCode(): string
    {
        return 'PAY-'.str_pad((string) $this->id, 3, '0', STR_PAD_LEFT);
    }
}
