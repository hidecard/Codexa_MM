<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseAnnouncement;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\CoursePackage;
use App\Models\CourseReview;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $instructor = User::firstOrCreate(
            ['email' => 'instructor@codexa.test'],
            ['name' => 'Codexa Academy', 'password' => 'password', 'status' => 'active'],
        );
        $instructor->assignRole('instructor');

        $catalog = [
            ['name' => 'Web Development', 'slug' => 'web-development', 'description' => 'Build modern web experiences from fundamentals to production.', 'position' => 1],
            ['name' => 'Programming Fundamentals', 'slug' => 'programming-fundamentals', 'description' => 'Develop the problem-solving foundation every developer needs.', 'position' => 2],
            ['name' => 'Product & Design', 'slug' => 'product-design', 'description' => 'Turn ideas into clear, useful digital products.', 'position' => 3],
        ];

        $categories = collect($catalog)->mapWithKeys(fn (array $attributes) => [
            $attributes['slug'] => CourseCategory::updateOrCreate(['slug' => $attributes['slug']], $attributes),
        ]);

        $courses = [
            ['category' => 'web-development', 'title' => 'Full-Stack Web Development', 'slug' => 'full-stack-web-development', 'short_description' => 'Learn the practical path from a blank folder to a deployed web application.', 'description' => 'A project-led path through HTML, CSS, JavaScript, Laravel, databases, and deployment.', 'level' => 'intermediate', 'duration' => 48, 'price' => 180000, 'pricing_type' => 'paid', 'outcomes' => ['Build responsive interfaces', 'Design relational databases', 'Ship a production-ready app']],
            ['category' => 'programming-fundamentals', 'title' => 'Programming with JavaScript', 'slug' => 'programming-with-javascript', 'short_description' => 'Build confidence with logic, data, functions, and real-world coding habits.', 'description' => 'A friendly, hands-on introduction to programming using JavaScript and practical exercises.', 'level' => 'beginner', 'duration' => 24, 'price' => 95000, 'pricing_type' => 'paid', 'outcomes' => ['Think in algorithms', 'Use modern JavaScript', 'Build small useful tools']],
            ['category' => 'product-design', 'title' => 'Digital Product Design', 'slug' => 'digital-product-design', 'short_description' => 'Move from a rough idea to a validated, usable product direction.', 'description' => 'Learn research, user flows, wireframes, interface systems, and product storytelling.', 'level' => 'beginner', 'duration' => 20, 'price' => 120000, 'pricing_type' => 'package', 'outcomes' => ['Map user journeys', 'Create interface systems', 'Present product decisions']],
        ];

        $seededCourses = collect();

        foreach ($courses as $attributes) {
            $category = $categories[$attributes['category']];
            unset($attributes['category']);
            $course = Course::updateOrCreate(
                ['slug' => $attributes['slug']],
                [
                    ...$attributes,
                    'category_id' => $category->id,
                    'instructor_id' => $instructor->id,
                    'status' => 'published',
                    'language' => 'en',
                    'published_at' => now(),
                ],
            );
            $seededCourses->push($course);

            foreach (['Foundations', 'Build a real project', 'Ship and grow'] as $position => $title) {
                $module = CourseModule::updateOrCreate(
                    ['course_id' => $course->id, 'position' => $position + 1],
                    ['title' => $title, 'description' => 'Practical lessons and guided exercises for this course.', 'position' => $position + 1],
                );

                $lesson = Lesson::updateOrCreate(
                    ['module_id' => $module->id, 'position' => 1],
                    ['title' => "{$title}: first steps", 'content' => 'A guided lesson with practical exercises and a clear next step.', 'duration' => 25, 'type' => 'video', 'is_free' => $position === 0, 'video_url' => 'private://lesson/'.$course->slug.'/'.$module->position, 'meta' => ['captions' => true]],
                );
                LessonResource::updateOrCreate(
                    ['lesson_id' => $lesson->id, 'original_name' => 'Lesson notes.pdf'],
                    ['file_path' => 'private/lessons/'.$lesson->id.'/notes.pdf', 'file_type' => 'application/pdf', 'file_size' => 0],
                );
            }

            CourseAnnouncement::updateOrCreate(
                ['course_id' => $course->id, 'title' => 'Welcome to the course'],
                ['content' => 'Start with the first module and work through the guided exercises at your own pace.', 'published_at' => now()],
            );

            if ($student = User::role('student')->first()) {
                CourseReview::updateOrCreate(
                    ['course_id' => $course->id, 'student_id' => $student->id],
                    ['rating' => 5, 'comment' => 'A practical and focused learning path.', 'is_approved' => true],
                );
            }
        }

        $package = CoursePackage::updateOrCreate(
            ['slug' => 'codexa-growth-bundle'],
            ['name' => 'Codexa Growth Bundle', 'description' => 'A practical bundle for learners building a complete product skill set.', 'price' => 250000, 'status' => 'published', 'published_at' => now()],
        );
        $package->courses()->sync($seededCourses->values()->mapWithKeys(fn (Course $course, int $position) => [$course->id => ['position' => $position + 1]])->all());
    }
}
