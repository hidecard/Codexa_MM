<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionFile extends Model
{
    protected $hidden = ['file_path'];

    protected $fillable = ['submission_id', 'file_path', 'file_type', 'original_name', 'file_size'];

    protected function casts(): array
    {
        return ['file_size' => 'integer'];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }
}
