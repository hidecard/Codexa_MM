<?php

namespace App\Support;

use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Throwable;

/**
 * Lightweight audit writer for the admin Activity Logs page, which reads
 * the system_logs table (SystemLog model). One line per decision point:
 *
 *     ActivityLog::record('payment.approved', 'Approved payment '.$payment->displayCode(), $payment);
 *
 * The event's prefix picks the channel (payment.* → payments, course.* →
 * courses, auth.* → auth, …). The ActivityLogController maps
 * channel/event/message keywords onto its filter tabs, so event names
 * should keep their domain word (payment, course, user, …).
 *
 * The actor defaults to the authenticated user and the IP to the current
 * request; the subject model feeds the page's target label
 * (context['subject'] and context['id']).
 */
class ActivityLog
{
    /** Event prefix → system_logs channel. */
    private const CHANNELS = [
        'payment' => 'payments',
        'refund' => 'payments',
        'payout' => 'payouts',
        'coupon' => 'coupons',
        'course' => 'courses',
        'enrollment' => 'enrollments',
        'user' => 'users',
        'staff' => 'staff',
        'role' => 'users',
        'auth' => 'auth',
        'settings' => 'settings',
    ];

    public static function record(
        string $event,
        string $message,
        ?Model $subject = null,
        ?User $actor = null,
        array $context = [],
        string $level = 'info',
    ): ?SystemLog {
        try {
            $actor ??= Auth::user();
            $request = request();

            if ($subject !== null) {
                // The Activity Logs page shows context['subject'] and
                // context['id'] as the entry's target label; an explicit
                // context subject wins over the derived one.
                $context['subject'] = $context['subject'] ?? self::subjectLabel($subject);
                $context['id'] = $subject->getKey();
                $context['subject_type'] = class_basename($subject);
            }

            $context = array_filter($context, fn ($value) => $value !== null);

            return SystemLog::create([
                'user_id' => $actor?->id,
                'level' => $level,
                'channel' => self::CHANNELS[Str::before($event, '.')] ?? 'application',
                'event' => $event,
                'message' => $message,
                'context' => $context ?: null,
                'request_id' => $request->header('X-Request-Id'),
                'ip_address' => $request->ip(),
            ]);
        } catch (Throwable $exception) {
            // Auditing must never break the action it records.
            report($exception);

            return null;
        }
    }

    /** Human label for a subject model: title/name/code when present. */
    private static function subjectLabel(Model $subject): string
    {
        foreach (['title', 'name', 'code'] as $attribute) {
            if (! empty($subject->{$attribute})) {
                return (string) $subject->{$attribute};
            }
        }

        if (method_exists($subject, 'displayCode')) {
            return $subject->displayCode();
        }

        return class_basename($subject);
    }
}
