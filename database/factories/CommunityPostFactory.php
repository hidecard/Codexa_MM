<?php

namespace Database\Factories;

use App\Models\CommunityPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommunityPostFactory extends Factory
{
    protected $model = CommunityPost::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category' => fake()->randomElement(CommunityPost::CATEGORIES),
            'title' => fake()->sentence(),
            'body' => fake()->paragraph(),
            'status' => CommunityPost::STATUS_PUBLISHED,
        ];
    }
}
