<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['payment_id', 'course_payment_id', 'amount', 'reason', 'status'])]
class Refund extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => 'string',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /** Academy course payment this refund is for (null for invoice-linked refunds). */
    public function coursePayment(): BelongsTo
    {
        return $this->belongsTo(CoursePayment::class);
    }
}
