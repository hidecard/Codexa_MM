<?php

namespace Database\Factories;

use App\Models\CommunityLike;
use App\Models\CommunityPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommunityLikeFactory extends Factory
{
    protected $model = CommunityLike::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'community_post_id' => CommunityPost::factory(),
        ];
    }
}
