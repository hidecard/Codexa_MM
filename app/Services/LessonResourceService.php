<?php

namespace App\Services;

use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\LessonResource;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Shared lesson-resource file handling for the instructor and admin
 * upload flows. Files live on the private `local` disk so they are only
 * reachable through the enrolled-student download route.
 */
class LessonResourceService
{
    public function store(Lesson $lesson, UploadedFile $file): LessonResource
    {
        $path = $file->storeAs('lessons/'.$lesson->id, $file->hashName(), 'local');

        return LessonResource::create([
            'lesson_id' => $lesson->id,
            'file_path' => $path,
            'file_type' => $file->getMimeType() ?: $file->getClientMimeType() ?: 'application/octet-stream',
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
        ]);
    }

    public function delete(LessonResource $resource): void
    {
        if ($resource->file_path) {
            Storage::disk('local')->delete($resource->file_path);
        }

        $resource->delete();
    }

    /** Remove every resource (row + file) attached to a lesson being deleted. */
    public function deleteForLesson(Lesson $lesson): void
    {
        $lesson->resources()->each(fn (LessonResource $resource) => $this->delete($resource));
    }

    /** Remove every resource (row + file) under all lessons of a module being deleted. */
    public function deleteForModule(CourseModule $module): void
    {
        $module->lessons()->each(fn (Lesson $lesson) => $this->deleteForLesson($lesson));
    }
}
