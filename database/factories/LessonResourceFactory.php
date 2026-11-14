<?php

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\LessonResource;
use Illuminate\Database\Eloquent\Factories\Factory;

class LessonResourceFactory extends Factory
{
    protected $model = LessonResource::class;

    public function definition(): array
    {
        return ['lesson_id' => Lesson::factory(), 'file_path' => 'lessons/'.fake()->uuid().'.pdf', 'file_type' => 'application/pdf', 'original_name' => fake()->words(3, true).'.pdf', 'file_size' => fake()->numberBetween(1000, 500000)];
    }
}
