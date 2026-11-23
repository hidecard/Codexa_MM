<?php

// Integration follow-up to the backend-completion work:
// 1. Academy refunds link to course_payments, not invoice payments, so
//    refunds.payment_id must be nullable (120004 added the nullable
//    course_payment_id but left payment_id NOT NULL, which made academy
//    refunds impossible to create).
// 2. Order-level course payments (course_id null) need an order_id link so
//    admin approval can enroll the student in every course on the order.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->unsignedBigInteger('payment_id')->nullable()->change();
        });

        Schema::table('course_payments', function (Blueprint $table) {
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('course_payments', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropColumn('order_id');
        });

        // refunds.payment_id is intentionally left nullable on rollback:
        // academy refunds created while it was nullable have no invoice
        // payment to point back to.
    }
};
