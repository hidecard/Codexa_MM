<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CourseFactory extends Factory
{
    protected $model = Course::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);
        return ['category_id' => CourseCategory::factory(), 'instructor_id' => User::factory(), 'title' => $title, 'slug' => Str::slug($title), 'description' => fake()->paragraph(), 'short_description' => fake()->sentence(), 'price' => 0, 'pricing_type' => 'free', 'status' => 'published', 'level' => 'beginner', 'language' => 'en', 'duration' => fake()->numberBetween(2, 40), 'outcomes' => [fake()->sentence()], 'published_at' => now()];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => 'draft', 'published_at' => null]);
    }
}
