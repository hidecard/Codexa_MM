<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\EnrollmentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function store(Request $request, Course $course, EnrollmentService $service): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user && $user->hasRole('student'), 403);

        $enrollment = $service->enroll($user, $course);

        if ($enrollment->status !== 'active') {
            return redirect()->route('courses.show', $course->slug)
                ->with('info', 'This paid course requires payment before access can be activated.');
        }

        return redirect()->route('student.courses.learn', $course->id)
            ->with('success', 'You are enrolled in this course.');
    }
}
