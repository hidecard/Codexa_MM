<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignmentAttachment extends Model
{
    protected $hidden = ['file_path'];

    protected $fillable = ['assignment_id', 'file_path', 'file_type', 'original_name', 'file_size'];

    protected function casts(): array
    {
        return ['file_size' => 'integer'];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }
}
