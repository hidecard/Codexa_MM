<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('course_categories')->cascadeOnDelete();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->string('language')->default('en');
            $table->unsignedInteger('duration')->default(0);
            $table->json('requirements')->nullable();
            $table->json('outcomes')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('course_instructors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['course_id', 'instructor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_instructors');
        Schema::dropIfExists('courses');
    }
};
