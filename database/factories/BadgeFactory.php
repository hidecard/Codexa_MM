<?php

namespace Database\Factories;

use App\Models\Badge;
use Illuminate\Database\Eloquent\Factories\Factory;

class BadgeFactory extends Factory
{
    protected $model = Badge::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(2, true),
            'icon' => 'target',
            'description' => fake()->sentence(),
            'rule_type' => Badge::RULE_XP_THRESHOLD,
            'threshold' => 100,
            'is_active' => true,
        ];
    }
}
