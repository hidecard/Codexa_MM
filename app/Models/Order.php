<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['student_id', 'total', 'status', 'coupon_code'])]
class Order extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'status' => 'string',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** Display code shown in the student UI, e.g. ORD-2026-0307. */
    public function displayCode(): string
    {
        return 'ORD-'.$this->created_at->format('Y').'-'.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT);
    }
}
