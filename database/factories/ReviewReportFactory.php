<?php

namespace Database\Factories;

use App\Models\CourseReview;
use App\Models\ReviewReport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewReportFactory extends Factory
{
    protected $model = ReviewReport::class;

    public function definition(): array
    {
        return [
            'course_review_id' => CourseReview::factory(),
            'reporter_id' => User::factory(),
            'reason' => fake()->sentence(),
            'status' => ReviewReport::STATUS_PENDING,
        ];
    }
}
