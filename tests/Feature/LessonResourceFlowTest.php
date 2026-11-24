<?php

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonResource;
use App\Models\User;
use Database\Seeders\CourseCatalogSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolesAndPermissionsSeeder::class);
    $this->seed(UserSeeder::class);
    Storage::fake('local');
});

function lrfInstructor(): User
{
    return User::query()->where('email', 'instructor@codexamm.test')->firstOrFail();
}

function lrfStudent(): User
{
    return User::query()->where('email', 'student@codexamm.test')->firstOrFail();
}

function lrfOtherStudent(): User
{
    return User::query()->where('email', 'test@example.com')->firstOrFail();
}

function lrfAdmin(): User
{
    return User::query()->where('email', 'admin@codexamm.test')->firstOrFail();
}

function lrfCourse(User $instructor): Course
{
    $category = CourseCategory::query()->create(['name' => 'Web', 'slug' => 'web-'.uniqid(), 'is_active' => true, 'position' => 1]);

    return Course::query()->create([
        'category_id' => $category->id,
        'instructor_id' => $instructor->id,
        'title' => 'Course '.uniqid(),
        'slug' => 'course-'.uniqid(),
        'price' => 50000,
        'pricing_type' => 'paid',
        'status' => 'published',
        'level' => 'beginner',
        'language' => 'en',
        'duration' => 60,
        'published_at' => now(),
    ]);
}

function lrfLesson(Course $course): Lesson
{
    $module = CourseModule::create(['course_id' => $course->id, 'title' => 'Module 1', 'position' => 1]);

    return Lesson::create([
        'module_id' => $module->id,
        'title' => 'Lesson 1',
        'content' => 'Content',
        'duration' => 10,
        'type' => 'video',
        'position' => 1,
    ]);
}

function lrfEnroll(User $student, Course $course): Enrollment
{
    return Enrollment::create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'active',
        'price_paid' => 50000,
        'enrolled_at' => now(),
    ]);
}

function lrfFakePdf(): UploadedFile
{
    return UploadedFile::fake()->createWithContent('notes.pdf', "%PDF-1.4\nLesson notes for testing.\n");
}

test('instructor uploads a lesson resource and the enrolled student can download it', function () {
    $instructor = lrfInstructor();
    $student = lrfStudent();
    $course = lrfCourse($instructor);
    $lesson = lrfLesson($course);
    lrfEnroll($student, $course);

    $this->actingAs($instructor)
        ->post(route('instructor.courses.modules.lessons.resources.store', [$course, $lesson->module, $lesson]), ['file' => lrfFakePdf()])
        ->assertRedirect()
        ->assertSessionHas('success');

    $resource = LessonResource::query()->firstOrFail();
    expect($resource->lesson_id)->toBe($lesson->id)
        ->and($resource->original_name)->toBe('notes.pdf')
        ->and($resource->file_type)->toBe('application/pdf')
        ->and(Storage::disk('local')->exists($resource->file_path))->toBeTrue()
        ->and(Storage::disk('local')->get($resource->file_path))->toContain('Lesson notes for testing.');

    $this->actingAs($student)
        ->get(route('student.resources.download', $resource))
        ->assertOk()
        ->assertDownload('notes.pdf');
});

test('non-enrolled student cannot download a lesson resource', function () {
    $instructor = lrfInstructor();
    $course = lrfCourse($instructor);
    $lesson = lrfLesson($course);

    $this->actingAs($instructor)
        ->post(route('instructor.courses.modules.lessons.resources.store', [$course, $lesson->module, $lesson]), ['file' => lrfFakePdf()])
        ->assertRedirect();

    $resource = LessonResource::query()->firstOrFail();

    // lrfOtherStudent() is a real student account with no enrollment here.
    $this->actingAs(lrfOtherStudent())
        ->get(route('student.resources.download', $resource))
        ->assertForbidden();
});

test('instructor cannot upload resources to a course they do not own', function () {
    $owner = lrfInstructor();
    $other = User::factory()->create(['status' => 'active', 'email_verified_at' => now()]);
    $other->assignRole('instructor');
    $course = lrfCourse($owner);
    $lesson = lrfLesson($course);

    $this->actingAs($other)
        ->post(route('instructor.courses.modules.lessons.resources.store', [$course, $lesson->module, $lesson]), ['file' => lrfFakePdf()])
        ->assertForbidden();

    expect(LessonResource::query()->count())->toBe(0);
});

test('admin can upload a lesson resource to any lesson', function () {
    $course = lrfCourse(lrfInstructor());
    $lesson = lrfLesson($course);

    $this->actingAs(lrfAdmin())
        ->post(route('admin.academy.lessons.resources.store', $lesson), ['file' => lrfFakePdf()])
        ->assertRedirect()
        ->assertSessionHas('success');

    $resource = LessonResource::query()->firstOrFail();
    expect($resource->lesson_id)->toBe($lesson->id)
        ->and(Storage::disk('local')->exists($resource->file_path))->toBeTrue();
});

test('upload rejects missing files and disallowed types', function () {
    $instructor = lrfInstructor();
    $course = lrfCourse($instructor);
    $lesson = lrfLesson($course);
    $url = route('instructor.courses.modules.lessons.resources.store', [$course, $lesson->module, $lesson]);

    $this->actingAs($instructor)->post($url, [])->assertSessionHasErrors('file');
    $this->actingAs($instructor)->post($url, ['file' => UploadedFile::fake()->create('evil.exe', 10, 'application/x-msdownload')])->assertSessionHasErrors('file');

    expect(LessonResource::query()->count())->toBe(0);
});

test('download of a resource whose file is missing redirects with an honest error', function () {
    $student = lrfStudent();
    $course = lrfCourse(lrfInstructor());
    $lesson = lrfLesson($course);
    lrfEnroll($student, $course);
    $resource = LessonResource::create([
        'lesson_id' => $lesson->id,
        'file_path' => 'lessons/'.$lesson->id.'/gone.pdf',
        'file_type' => 'application/pdf',
        'original_name' => 'Gone.pdf',
        'file_size' => 100,
    ]);

    $this->actingAs($student)
        ->from(route('student.resources.index'))
        ->get(route('student.resources.download', $resource))
        ->assertRedirect(route('student.resources.index'))
        ->assertSessionHasErrors('download');
});

test('instructor can delete a lesson resource and its file is removed', function () {
    $instructor = lrfInstructor();
    $course = lrfCourse($instructor);
    $lesson = lrfLesson($course);

    $this->actingAs($instructor)
        ->post(route('instructor.courses.modules.lessons.resources.store', [$course, $lesson->module, $lesson]), ['file' => lrfFakePdf()])
        ->assertRedirect();

    $resource = LessonResource::query()->firstOrFail();
    $path = $resource->file_path;
    expect(Storage::disk('local')->exists($path))->toBeTrue();

    $this->actingAs($instructor)
        ->delete(route('instructor.courses.modules.lessons.resources.destroy', [$course, $lesson->module, $lesson, $resource]))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(LessonResource::query()->count())->toBe(0)
        ->and(Storage::disk('local')->exists($path))->toBeFalse();
});

test('seeder ships exactly one sample resource with a real downloadable file', function () {
    $this->seed(CourseCatalogSeeder::class);

    $resources = LessonResource::query()->get();
    expect($resources)->toHaveCount(1);

    $sample = $resources->first();
    expect($sample->original_name)->toBe('SAMPLE - Lesson notes.txt')
        ->and(Storage::disk('local')->exists($sample->file_path))->toBeTrue()
        ->and(Storage::disk('local')->get($sample->file_path))->toContain('SAMPLE FILE');

    // No phantom rows pointing at files that never existed.
    expect(LessonResource::query()->where('original_name', 'Lesson notes.pdf')->count())->toBe(0);

    $course = Course::query()->where('slug', 'full-stack-web-development')->firstOrFail();
    $student = lrfStudent();
    lrfEnroll($student, $course);

    $this->actingAs($student)
        ->get(route('student.resources.download', $sample))
        ->assertOk()
        ->assertDownload('SAMPLE - Lesson notes.txt');
});

test('deleting a module removes its lessons resource files instead of orphaning them', function () {
    $instructor = lrfInstructor();
    $course = lrfCourse($instructor);
    $lesson = lrfLesson($course);
    $module = $lesson->module;

    $this->actingAs($instructor)
        ->post(route('instructor.courses.modules.lessons.resources.store', [$course, $module, $lesson]), ['file' => lrfFakePdf()])
        ->assertRedirect();

    $resource = LessonResource::query()->firstOrFail();
    $path = $resource->file_path;
    expect(Storage::disk('local')->exists($path))->toBeTrue();

    $this->actingAs($instructor)
        ->delete(route('instructor.courses.modules.destroy', [$course, $module]))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(LessonResource::query()->count())->toBe(0)
        ->and(Storage::disk('local')->exists($path))->toBeFalse()
        ->and(Lesson::query()->count())->toBe(0)
        ->and(CourseModule::query()->count())->toBe(0);
});
