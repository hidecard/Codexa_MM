<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportHistory extends Model
{
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_PARTIAL = 'partial';
    public const STATUS_FAILED = 'failed';

    public const STATUSES = [
        self::STATUS_COMPLETED,
        self::STATUS_PARTIAL,
        self::STATUS_FAILED,
    ];

    protected $fillable = [
        'user_id',
        'filename',
        'status',
        'rows_total',
        'rows_imported',
        'rows_skipped',
        'rows_failed',
        'errors',
    ];

    protected function casts(): array
    {
        return [
            'rows_total' => 'integer',
            'rows_imported' => 'integer',
            'rows_skipped' => 'integer',
            'rows_failed' => 'integer',
            'errors' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Derive the import status from its outcome: failed when nothing was
     * imported, partial when any row was skipped or failed, else completed.
     */
    public static function statusForOutcome(int $imported, int $skipped, int $failed): string
    {
        if ($imported === 0) {
            return self::STATUS_FAILED;
        }

        if ($skipped > 0 || $failed > 0) {
            return self::STATUS_PARTIAL;
        }

        return self::STATUS_COMPLETED;
    }

    public function toDisplayArray(): array
    {
        return [
            'id' => $this->id,
            'filename' => $this->filename,
            'status' => $this->status,
            'rows_total' => $this->rows_total,
            'rows_imported' => $this->rows_imported,
            'rows_skipped' => $this->rows_skipped,
            'rows_failed' => $this->rows_failed,
            'errors' => $this->errors ?? [],
            'imported_by' => $this->user?->name ?? '',
            'date' => $this->created_at?->format('Y-m-d H:i') ?? '',
        ];
    }
}
