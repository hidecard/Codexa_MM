<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Course;
use App\Models\CourseCategory;
use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\Enrollment;
use App\Models\Assignment;
use App\Models\User;

echo "Published courses: " . Course::published()->count() . "\n";
echo "Course categories (active): " . CourseCategory::where('is_active', true)->count() . "\n";
echo "Course modules: " . CourseModule::count() . "\n";
echo "Lessons: " . Lesson::count() . "\n";
echo "Enrollments: " . Enrollment::count() . "\n";
echo "Assignments: " . Assignment::count() . "\n";
echo "Users: " . User::count() . "\n";

echo "\nPublished courses:\n";
$courses = Course::published()->with('category:id,name,slug')->get();
foreach ($courses as $c) {
    $catName = $c->category ? $c->category->name : 'none';
    echo "  - " . $c->slug . " | " . $c->title . " | cat=" . $catName . "\n";
}

echo "\nCategories:\n";
$cats = CourseCategory::where('is_active', true)->get();
foreach ($cats as $c) {
    echo "  - " . $c->slug . " | " . $c->name . " | courses=" . $c->courses()->published()->count() . "\n";
}

echo "\nEnrollments by student:\n";
$enrollments = Enrollment::all();
foreach ($enrollments as $e) {
    echo "  - student_id=" . $e->student_id . " course_id=" . $e->course_id . " status=" . $e->status . "\n";
}
