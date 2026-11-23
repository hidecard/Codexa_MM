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
use Illuminate\Support\Facades\Storage;

class CourseCatalogSeeder extends Seeder
{
    public function run(): void
    {
        // Use the UserSeeder instructor account as the catalog owner (no competing seed users).
        $instructor = User::firstOrCreate(
            ['email' => 'instructor@codexamm.test'],
            ['name' => 'Instructor User', 'password' => 'password', 'status' => 'active', 'email_verified_at' => now()],
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

        // Idempotent: updateOrCreate so re-running the seeder does not violate the unique email constraint.
        $coInstructors = collect([
            ['name' => 'Mya Thandar', 'email' => 'mya.thandar@codexa.test'],
            ['name' => 'Ko Aung Htet', 'email' => 'ko.aung.htet@codexa.test'],
        ])->map(function (array $attributes) {
            $coInstructor = User::updateOrCreate(
                ['email' => $attributes['email']],
                [...$attributes, 'password' => 'password', 'status' => 'active', 'email_verified_at' => now()],
            );
            $coInstructor->assignRole('instructor');

            return $coInstructor;
        });

        $seededCourses = collect();
        $firstLesson = null;

        foreach ($courses as $i => $attributes) {
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
            $course->instructors()->syncWithoutDetaching([$coInstructors[$i % $coInstructors->count()]->id]);
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
                // Real lesson files are the instructor's to upload; the seeder
                // only ships one clearly-marked sample (see seedSampleResource).
                $firstLesson ??= $lesson;
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

        $this->seedSampleResource($firstLesson);
    }

    /**
     * Seed exactly one clearly-marked sample resource with a real file on
     * disk, so the lesson-resource download path works in dev. This is a
     * placeholder, not lesson content — real files are the instructor's
     * to upload. Seeding never fails if storage is unavailable: the
     * sample is simply skipped. Previously-seeded phantom rows (files
     * that never existed on disk) are removed so downloads stop erroring.
     */
    private function seedSampleResource(?Lesson $lesson): void
    {
        LessonResource::query()
            ->where('original_name', 'Lesson notes.pdf')
            ->where('file_path', 'like', 'private/lessons/%')
            ->get()
            ->each(function (LessonResource $resource) {
                try {
                    if (! Storage::disk('local')->exists($resource->file_path)) {
                        $resource->delete();
                    }
                } catch (\Throwable) {
                    // Storage unavailable: leave the row alone, never break seeding.
                }
            });

        if (! $lesson) {
            return;
        }

        $path = 'lessons/sample/sample-lesson-notes.txt';
        $contents = "SAMPLE FILE - Codexa MM lesson resource placeholder.\n\n"
            ."This is a sample file shipped with the demo seed data so the lesson\n"
            ."resource download path can be verified. It is not real lesson content.\n\n"
            ."Instructors upload real lesson files from the course curriculum editor.\n"
            ."Enrolled students can download them from the lesson player or the\n"
            ."Resources page.\n";

        try {
            if (! Storage::disk('local')->exists($path)) {
                Storage::disk('local')->put($path, $contents);
            }
            if (! Storage::disk('local')->exists($path)) {
                return;
            }
            $size = Storage::disk('local')->size($path);
        } catch (\Throwable) {
            return;
        }

        LessonResource::updateOrCreate(
            ['original_name' => 'SAMPLE - Lesson notes.txt'],
            [
                'lesson_id' => $lesson->id,
                'file_path' => $path,
                'file_type' => 'text/plain',
                'file_size' => $size,
            ],
        );
    }
}
