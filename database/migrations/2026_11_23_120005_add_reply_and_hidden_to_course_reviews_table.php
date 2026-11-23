<?php

// STUB — owned by Worker 2: fill in up()/down() for this migration. Do not rename
// this file (fixed timestamp keeps parallel workers from colliding).

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_reviews', function (Blueprint $table) {
            $table->text('reply')->nullable()->after('comment');
            $table->boolean('is_hidden')->default(false)->after('is_approved');
        });
    }

    public function down(): void
    {
        Schema::table('course_reviews', function (Blueprint $table) {
            $table->dropColumn(['reply', 'is_hidden']);
        });
    }
};
