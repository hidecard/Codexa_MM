<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EnrollmentService
{
    public function enroll(User $student, Course $course): Enrollment
    {
        if ($course->status !== 'published' || ! $course->published_at) {
            throw ValidationException::withMessages(['course' => 'This course is not available for enrollment.']);
        }

        return DB::transaction(function () use ($student, $course) {
            $existing = Enrollment::query()
                ->where('student_id', $student->id)
                ->where('course_id', $course->id)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                return $existing;
            }

            $price = $course->pricing_type === 'free' ? 0 : (float) ($course->sale_price ?? $course->price);
            $status = $course->pricing_type === 'free' ? 'active' : 'pending';

            return Enrollment::create([
                'student_id' => $student->id,
                'course_id' => $course->id,
                'status' => $status,
                'price_paid' => $price,
                'enrolled_at' => now(),
            ]);
        });
    }
}
