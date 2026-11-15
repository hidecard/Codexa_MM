<?php

namespace Database\Factories;

use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuizAnswerFactory extends Factory
{
    protected $model = QuizAnswer::class;

    public function definition(): array
    {
        return [
            'attempt_id' => QuizAttempt::factory(),
            'question_id' => QuizQuestion::factory(),
            'answer' => fake()->randomElement(['A', 'B', 'C', 'D']),
            'is_correct' => fake()->optional()->boolean(),
        ];
    }
}
