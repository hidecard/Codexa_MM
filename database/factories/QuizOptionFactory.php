<?php

namespace Database\Factories;

use App\Models\QuizOption;
use App\Models\QuizQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuizOptionFactory extends Factory
{
    protected $model = QuizOption::class;

    public function definition(): array
    {
        return [
            'question_id' => QuizQuestion::factory(),
            'option_text' => fake()->sentence(5),
            'is_correct' => fake()->boolean(),
            'position' => fake()->numberBetween(1, 10),
        ];
    }

    public function correct(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_correct' => true,
        ]);
    }
}
