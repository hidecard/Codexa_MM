<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseQuestion;
use App\Models\Enrollment;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class QuestionController extends Controller
{
    /**
     * Ask a question about a lesson (from the lesson player). Only students
     * enrolled in the course may ask; the instructor answers from the
     * instructor Q&A page.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'lesson_id' => ['nullable', 'integer', 'exists:lessons,id'],
            'question' => ['required', 'string', 'max:5000'],
        ]);

        $enrolled = Enrollment::query()
            ->where('student_id', $request->user()->id)
            ->where('course_id', $validated['course_id'])
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        if (! $enrolled) {
            throw ValidationException::withMessages([
                'course_id' => 'စာရင်းသွင်းထားသော သင်တန်းကိုသာ မေးခွန်း မေးနိုင်ပါသည်။',
            ]);
        }

        if (! empty($validated['lesson_id'])) {
            $lesson = Lesson::query()->with('module:id,course_id')->findOrFail($validated['lesson_id']);

            abort_unless($lesson->module && $lesson->module->course_id === (int) $validated['course_id'], 422, 'Lesson does not belong to this course.');
        }

        CourseQuestion::create([
            'course_id' => $validated['course_id'],
            'student_id' => $request->user()->id,
            'lesson_id' => $validated['lesson_id'] ?? null,
            'question' => $validated['question'],
        ]);

        return back()->with('success', 'မေးခွန်း တင်ပြီးပါပြီ — ဆရာ ဖြေကြားပေးပါမယ်');
    }
}
