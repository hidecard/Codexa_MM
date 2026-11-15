<?php

namespace Database\Factories;

use App\Models\CoursePackage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CoursePackageFactory extends Factory
{
    protected $model = CoursePackage::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return ['name' => $name, 'slug' => Str::slug($name), 'description' => fake()->sentence(), 'price' => fake()->numberBetween(150000, 500000), 'status' => 'published', 'published_at' => now()];
    }
}
