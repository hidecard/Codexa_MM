<?php

namespace Database\Factories;

use App\Models\Faq;
use Illuminate\Database\Eloquent\Factories\Factory;

class FaqFactory extends Factory
{
    protected $model = Faq::class;

    public function definition(): array
    {
        return [
            'question' => fake()->sentence().'?',
            'answer' => fake()->paragraph(),
            'category' => fake()->randomElement(['General', 'Academy', 'Solutions']),
            'sort_order' => fake()->numberBetween(0, 20),
            'is_published' => true,
        ];
    }

    public function unpublished(): static
    {
        return $this->state(fn () => ['is_published' => false]);
    }
}
