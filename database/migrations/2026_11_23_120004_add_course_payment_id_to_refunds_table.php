<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Link refunds to academy course payments; `payment_id` stays for
        // invoice-linked (Solutions) refunds.
        Schema::table('refunds', function (Blueprint $table) {
            $table->foreignId('course_payment_id')->nullable()->after('payment_id')->constrained('course_payments')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('refunds', function (Blueprint $table) {
            $table->dropForeign(['course_payment_id']);
            $table->dropColumn('course_payment_id');
        });
    }
};
