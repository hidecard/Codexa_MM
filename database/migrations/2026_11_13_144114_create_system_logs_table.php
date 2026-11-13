<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('level')->default('info')->index();
            $table->string('channel')->default('application')->index();
            $table->string('event')->index();
            $table->text('message');
            $table->json('context')->nullable();
            $table->string('request_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->index(['created_at', 'level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
