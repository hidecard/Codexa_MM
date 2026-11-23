<?php

// STUB — owned by Worker 4: fill in up()/down() for this migration. Do not rename
// this file (fixed timestamp keeps parallel workers from colliding).

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subject');
            $table->text('body');
            $table->string('audience');
            $table->enum('status', ['draft', 'scheduled', 'sent'])->default('draft');
            $table->dateTime('scheduled_at')->nullable();
            $table->dateTime('sent_at')->nullable();
            $table->unsignedInteger('recipients_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_campaigns');
    }
};
