<?php

namespace Database\Factories;

use App\Models\InstructorApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InstructorApplicationFactory extends Factory
{
    protected $model = InstructorApplication::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'bio' => fake()->paragraph(),
            'expertise' => fake()->randomElement(['Python', 'React', 'Laravel', 'UI/UX']),
            'experience' => 'အတွေ့အကြုံ 3–4 နှစ်',
            'portfolio_links' => ['https://example.com/portfolio'],
            'status' => InstructorApplication::STATUS_PENDING,
        ];
    }
}
