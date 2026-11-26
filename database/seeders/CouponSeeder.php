<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'CODEXA10',
                'discount_type' => 'percent',
                'discount_value' => 10,
                'usage_limit' => 1000,
                'used_count' => 42,
                'expires_at' => now()->addMonths(3),
                'is_active' => true,
            ],
            [
                'code' => 'WELCOME20',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'usage_limit' => 500,
                'used_count' => 15,
                'expires_at' => now()->addMonths(2),
                'is_active' => true,
            ],
            [
                'code' => 'STUDENT50',
                'discount_type' => 'percent',
                'discount_value' => 50,
                'usage_limit' => 100,
                'used_count' => 8,
                'expires_at' => now()->addMonth(),
                'is_active' => true,
            ],
            [
                'code' => 'EARLYBIRD',
                'discount_type' => 'fixed',
                'discount_value' => 20000,
                'usage_limit' => 200,
                'used_count' => 23,
                'expires_at' => now()->addWeeks(2),
                'is_active' => true,
            ],
            [
                'code' => 'EXPIRED50',
                'discount_type' => 'percent',
                'discount_value' => 50,
                'usage_limit' => 50,
                'used_count' => 50,
                'expires_at' => now()->subDays(5),
                'is_active' => true,
            ],
            [
                'code' => 'INACTIVE20',
                'discount_type' => 'percent',
                'discount_value' => 20,
                'usage_limit' => 100,
                'used_count' => 0,
                'expires_at' => now()->addMonth(),
                'is_active' => false,
            ],
        ];

        foreach ($coupons as $couponData) {
            Coupon::updateOrCreate(
                ['code' => $couponData['code']],
                $couponData
            );
        }

        $this->command->info('CouponSeeder completed.');
    }
}