<?php

namespace Database\Factories;

use App\Models\CourseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CourseCategoryFactory extends Factory
{
    protected $model = CourseCategory::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);
        return ['name' => $name, 'slug' => Str::slug($name), 'description' => fake()->sentence(), 'position' => fake()->numberBetween(1, 10), 'is_active' => true];
    }
}
