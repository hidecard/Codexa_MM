<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Quiz;
use Illuminate\Database\Eloquent\Factories\Factory;

class QuizFactory extends Factory
{
    protected $model = Quiz::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'pass_mark' => fake()->numberBetween(50, 80),
            'time_limit' => fake()->optional()->numberBetween(10, 120),
            'shuffle_questions' => fake()->boolean(),
            'show_correct_answers' => fake()->boolean(),
        ];
    }
}
