<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuizQuestionFactory extends Factory
{
    protected $model = QuizQuestion::class;

    public function definition(): array
    {
        return [
            'quiz_id' => Quiz::factory(),
            'question' => fake()->sentence(8),
            'type' => fake()->randomElement(['single_choice', 'multiple_choice', 'true_false', 'short_answer']),
            'points' => fake()->numberBetween(1, 10),
            'position' => fake()->numberBetween(1, 100),
            'explanation' => fake()->optional()->sentence(),
        ];
    }
}
