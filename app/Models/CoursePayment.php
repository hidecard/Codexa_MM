<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CoursePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'course_id',
        'order_id',
        'amount',
        'method',
        'status',
        'reference',
        'coupon_code',
        'reviewed_by',
        'reviewed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /** Display code shown in the admin UI, e.g. TXN-0042. */
    public function displayCode(): string
    {
        return 'TXN-'.str_pad((string) $this->id, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Mark this payment refunded and revoke the course access it paid for:
     * the single course, or every course on the linked order (which is also
     * marked cancelled).
     */
    public function markRefunded(): void
    {
        $this->update(['status' => 'refunded']);

        if ($this->order_id !== null && $this->order !== null) {
            $courseIds = $this->order->items()->pluck('course_id');

            Enrollment::query()
                ->where('student_id', $this->student_id)
                ->whereIn('course_id', $courseIds)
                ->whereIn('status', ['active', 'pending'])
                ->update(['status' => 'refunded']);

            $this->order->update(['status' => 'cancelled']);
        } elseif ($this->course_id !== null) {
            Enrollment::query()
                ->where('student_id', $this->student_id)
                ->where('course_id', $this->course_id)
                ->whereIn('status', ['active', 'pending'])
                ->update(['status' => 'refunded']);
        }
    }
}
