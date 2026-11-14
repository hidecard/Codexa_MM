<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\CourseAnnouncement;
use Illuminate\Database\Eloquent\Factories\Factory;

class CourseAnnouncementFactory extends Factory
{
    protected $model = CourseAnnouncement::class;

    public function definition(): array
    {
        return ['course_id' => Course::factory(), 'title' => fake()->sentence(5), 'content' => fake()->paragraph(), 'published_at' => now()];
    }
}
