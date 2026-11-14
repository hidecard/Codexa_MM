<?php

namespace Database\Factories;

use App\Models\CourseModule;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

class LessonFactory extends Factory
{
    protected $model = Lesson::class;

    public function definition(): array
    {
        return ['module_id' => CourseModule::factory(), 'title' => fake()->sentence(4), 'content' => fake()->paragraphs(2, true), 'video_url' => 'https://video.example.test/private/'.fake()->uuid(), 'duration' => fake()->numberBetween(5, 60), 'position' => fake()->numberBetween(1, 10), 'type' => 'video', 'is_free' => false, 'meta' => ['captions' => false]];
    }

    public function free(): static
    {
        return $this->state(fn () => ['is_free' => true]);
    }
}
