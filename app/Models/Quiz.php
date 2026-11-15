<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    protected $fillable = [
        'course_id',
        'title',
        'description',
        'pass_mark',
        'time_limit',
        'shuffle_questions',
        'show_correct_answers',
    ];

    protected function casts(): array
    {
        return [
            'pass_mark' => 'integer',
            'time_limit' => 'integer',
            'shuffle_questions' => 'boolean',
            'show_correct_answers' => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('position');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
