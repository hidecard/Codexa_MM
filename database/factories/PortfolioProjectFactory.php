<?php

namespace Database\Factories;

use App\Models\PortfolioProject;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PortfolioProjectFactory extends Factory
{
    protected $model = PortfolioProject::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'description' => fake()->paragraphs(3, true),
            'short_description' => fake()->sentence(),
            'client_name' => fake()->company(),
            'project_url' => fake()->optional()->url(),
            'technologies' => ['Laravel', 'React', 'TypeScript'],
            'status' => 'published',
            'position' => fake()->numberBetween(0, 10),
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => 'draft', 'published_at' => null]);
    }
}
