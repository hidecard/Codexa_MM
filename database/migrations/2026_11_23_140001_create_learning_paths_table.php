<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_paths', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('level')->default('Beginner → Intermediate');
            $table->string('duration_label')->default('၃–၄ လ');
            $table->string('gradient')->default('linear-gradient(130deg,#0b3b5e,#0ea892)');
            $table->string('glyph', 8)->default('</>');
            $table->json('outcomes')->nullable();
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('learning_path_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_path_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->unique(['learning_path_id', 'course_id']);
        });

        Schema::create('learning_path_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_path_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['learning_path_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_path_user');
        Schema::dropIfExists('learning_path_courses');
        Schema::dropIfExists('learning_paths');
    }
};
