<?php

namespace App\Http\Controllers\Admin\Academy;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SystemController extends Controller
{
    public function index(): Response
    {
        $dbPath = database_path('database.sqlite');
        $storagePath = storage_path();

        $dbOk = false;
        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (\Throwable) {
            $dbOk = false;
        }

        $diskTotal = disk_total_space($storagePath);
        $diskFree = disk_free_space($storagePath);

        return Inertia::render('Admin/Academy/System/Index', [
            'system' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => Application::VERSION,
                'app_env' => config('app.env'),
                'app_debug' => (bool) config('app.debug'),
                'maintenance' => app()->isDownForMaintenance(),
                'database' => [
                    'driver' => config('database.default'),
                    'ok' => $dbOk,
                    'file' => basename($dbPath),
                    'size_bytes' => is_file($dbPath) ? filesize($dbPath) : null,
                    'size_human' => is_file($dbPath) ? $this->humanBytes((int) filesize($dbPath)) : '—',
                ],
                'storage' => [
                    'free_bytes' => $diskFree === false ? null : (int) $diskFree,
                    'total_bytes' => $diskTotal === false ? null : (int) $diskTotal,
                    'free_human' => $diskFree === false ? '—' : $this->humanBytes((int) $diskFree),
                    'total_human' => $diskTotal === false ? '—' : $this->humanBytes((int) $diskTotal),
                    'used_percent' => ($diskTotal && $diskFree !== false)
                        ? round((1 - $diskFree / $diskTotal) * 100, 1)
                        : null,
                    'writable' => is_writable($storagePath),
                ],
                'queue' => config('queue.default'),
                'cache' => config('cache.default'),
                'mail' => config('mail.default'),
                'counts' => [
                    'users' => User::count(),
                    'courses' => Course::count(),
                    'enrollments' => Enrollment::count(),
                ],
            ],
        ]);
    }

    private function humanBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        $value = (float) $bytes;

        while ($value >= 1024 && $i < count($units) - 1) {
            $value /= 1024;
            $i++;
        }

        return round($value, 1).' '.$units[$i];
    }
}
