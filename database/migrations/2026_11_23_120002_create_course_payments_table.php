<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Academy course / Pro-plan payments. Kept separate from the
        // invoice/project-based `payments` table, which has no student link.
        Schema::create('course_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->enum('method', ['kbzpay', 'wavepay', 'cbpay', 'bank']);
            $table->enum('status', ['pending', 'approved', 'rejected', 'refunded'])->default('pending');
            $table->string('reference')->nullable();
            $table->string('coupon_code')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('reviewed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['student_id', 'status']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_payments');
    }
};
