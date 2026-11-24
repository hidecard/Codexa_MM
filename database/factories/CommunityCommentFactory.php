<?php

namespace Database\Factories;

use App\Models\CommunityComment;
use App\Models\CommunityPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommunityCommentFactory extends Factory
{
    protected $model = CommunityComment::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'community_post_id' => CommunityPost::factory(),
            'body' => fake()->paragraph(),
        ];
    }
}
