<?php

namespace App\Observers;

use App\Models\Course;
use App\Support\ActivityLog;

/**
 * Logs the course lifecycle (create / update / publish / archive /
 * delete) to system_logs. An observer covers every creation path —
 * instructor courses, the creation wizard, bulk import — without
 * touching each controller. Seeding stays quiet: DatabaseSeeder uses
 * WithoutModelEvents.
 */
class CourseObserver
{
    /** Content fields worth an audit entry; touches alone are not logged. */
    private const WATCHED = [
        'title', 'slug', 'description', 'short_description',
        'price', 'sale_price', 'pricing_type', 'status', 'level',
        'language', 'duration', 'category_id', 'instructor_id', 'published_at',
    ];

    public function created(Course $course): void
    {
        if ($course->status === 'published') {
            ActivityLog::record('course.published', 'Published course '.$course->title, $course);

            return;
        }

        ActivityLog::record('course.created', 'Created course '.$course->title, $course);
    }

    public function updated(Course $course): void
    {
        if (! $course->wasChanged(self::WATCHED)) {
            return;
        }

        if ($course->wasChanged('status') && $course->status === 'published') {
            ActivityLog::record('course.published', 'Published course '.$course->title, $course);

            return;
        }

        if ($course->wasChanged('status') && $course->status === 'archived') {
            ActivityLog::record('course.archived', 'Archived course '.$course->title, $course);

            return;
        }

        if ($course->wasChanged('status')) {
            ActivityLog::record('course.updated', 'Changed course '.$course->title.' status to '.$course->status, $course);

            return;
        }

        ActivityLog::record('course.updated', 'Updated course '.$course->title, $course);
    }

    public function deleted(Course $course): void
    {
        ActivityLog::record('course.deleted', 'Deleted course '.$course->title, $course, level: 'warning');
    }
}
