<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CoursePayment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $students = User::role('student')->get();
        $courses = Course::published()->get();

        if ($students->isEmpty() || $courses->isEmpty()) {
            $this->command->warn('No students or courses found, skipping OrderSeeder.');
            return;
        }

        // Clean up existing seeded data for these students to avoid duplicates
        \App\Models\CoursePayment::whereIn('student_id', $students->pluck('id'))->delete();
        \App\Models\Enrollment::whereIn('student_id', $students->pluck('id'))->delete();
        Order::whereIn('student_id', $students->pluck('id'))->delete();

        $orders = [
            [
                'student' => 'Student User',
                'items' => [
                    ['course' => 'Full-Stack Web Development', 'price' => 180000],
                    ['course' => 'Programming with JavaScript', 'price' => 95000],
                ],
                'status' => 'paid',
                'payment_status' => 'approved',
                'method' => 'kbzpay',
                'days_ago' => 10,
                'ref' => 'ORD-FSD-JS',
            ],
            [
                'student' => 'Student User',
                'items' => [
                    ['course' => 'Digital Product Design', 'price' => 120000],
                ],
                'status' => 'paid',
                'payment_status' => 'approved',
                'method' => 'wavepay',
                'days_ago' => 5,
                'ref' => 'ORD-DPD',
            ],
            [
                'student' => 'Test User',
                'items' => [
                    ['course' => 'Full-Stack Web Development', 'price' => 180000],
                ],
                'status' => 'paid',
                'payment_status' => 'approved',
                'method' => 'bank',
                'days_ago' => 3,
                'ref' => 'ORD-FSD-2',
            ],
            [
                'student' => 'Test User',
                'items' => [
                    ['course' => 'Programming with JavaScript', 'price' => 95000],
                ],
                'status' => 'pending',
                'payment_status' => 'pending',
                'method' => 'cbpay',
                'days_ago' => 1,
                'ref' => 'ORD-JS-2',
            ],
            [
                'student' => 'Student User',
                'items' => [
                    ['course' => 'Digital Product Design', 'price' => 120000],
                ],
                'status' => 'cancelled',
                'payment_status' => 'rejected',
                'method' => 'kbzpay',
                'days_ago' => 15,
                'ref' => 'ORD-DPD-2',
            ],
        ];

        foreach ($orders as $orderData) {
            $student = $students->firstWhere('name', $orderData['student']);
            if (! $student) {
                continue;
            }

            $total = 0;
            $validItems = [];

            foreach ($orderData['items'] as $item) {
                $course = $courses->firstWhere('title', $item['course']);
                if ($course) {
                    $validItems[] = ['course' => $course, 'price' => $item['price']];
                    $total += $item['price'];
                }
            }

            if (empty($validItems)) {
                continue;
            }

            $createdAt = now()->subDays($orderData['days_ago']);

            $order = Order::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'total' => $total,
                    'status' => $orderData['status'],
                    'created_at' => $createdAt,
                ],
                [
                    'coupon_code' => null,
                ]
            );

            // Set the created_at explicitly since updateOrCreate doesn't update timestamps on existing records
            if ($order->wasRecentlyCreated === false) {
                $order->update(['created_at' => $createdAt, 'updated_at' => $createdAt]);
            }

            foreach ($validItems as $item) {
                OrderItem::updateOrCreate(
                    ['order_id' => $order->id, 'course_id' => $item['course']->id],
                    ['price' => $item['price']]
                );

                CoursePayment::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'course_id' => $item['course']->id,
                        'order_id' => $order->id,
                    ],
                    [
                        'amount' => $item['price'],
                        'method' => $orderData['method'],
                        'status' => $orderData['payment_status'],
                        'reference' => 'REF-'.str()->upper(str()->random(8)),
                        'coupon_code' => null,
                    ]
                );
            }

            // Create enrollment if payment completed
            if ($orderData['status'] === 'paid') {
                foreach ($validItems as $item) {
                    \App\Models\Enrollment::updateOrCreate(
                        ['student_id' => $student->id, 'course_id' => $item['course']->id],
                        ['status' => 'active', 'enrolled_at' => $createdAt]
                    );
                }
            }
        }

        $this->command->info('OrderSeeder completed.');
    }
}