<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Announcement fields from the prototype:
     * - type: general | course | live | promo | system (default general)
     * - audience: all | students | instructors (default all). Announcements
     *   stay course-scoped; 'all' means every student enrolled in the
     *   course, 'instructors' is instructor-only (hidden from students).
     * - is_pinned: pinned announcements sort first in the student list.
     */
    public function up(): void
    {
        Schema::table('course_announcements', function (Blueprint $table) {
            $table->string('type')->default('general')->after('content');
            $table->string('audience')->default('all')->after('type');
            $table->boolean('is_pinned')->default(false)->after('audience');
        });
    }

    public function down(): void
    {
        Schema::table('course_announcements', function (Blueprint $table) {
            $table->dropColumn(['type', 'audience', 'is_pinned']);
        });
    }
};
