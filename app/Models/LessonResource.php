<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['lesson_id', 'file_path', 'file_type', 'original_name', 'file_size'])]
class LessonResource extends Model
{
    use HasFactory;

    protected $hidden = ['file_path'];

    protected function casts(): array
    {
        return ['file_size' => 'integer'];
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
