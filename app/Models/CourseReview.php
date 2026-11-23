<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['student_id', 'course_id', 'rating', 'comment', 'is_approved', 'reply', 'is_hidden'])]
class CourseReview extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['rating' => 'integer', 'is_approved' => 'boolean', 'is_hidden' => 'boolean'];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
