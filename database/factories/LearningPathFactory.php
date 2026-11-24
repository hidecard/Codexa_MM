<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LearningPath>
 */
class LearningPathFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->sentence(),
            'level' => 'Beginner → Intermediate',
            'duration_label' => '၃–၄ လ',
            'gradient' => 'linear-gradient(130deg,#0b3b5e,#0ea892)',
            'glyph' => '</>',
            'outcomes' => [$this->faker->sentence()],
            'is_published' => true,
            'sort_order' => 0,
        ];
    }
}
