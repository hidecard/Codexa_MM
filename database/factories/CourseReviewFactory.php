<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseReview;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseReviewFactory extends Factory
{
    protected $model = CourseReview::class;

    public function definition(): array
    {
        return ['student_id' => User::factory(), 'course_id' => Course::factory(), 'rating' => fake()->numberBetween(3, 5), 'comment' => fake()->sentence(), 'is_approved' => true];
    }
}
