<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Leave;
use App\Models\ContentCalendar;
use App\Models\DailyWorksheet;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $today = Carbon::today();

        $stats = [
            'total_tasks' => $user->tasks()->count(),
            'pending_tasks' => $user->tasks()->where('status', 'pending')->count(),
            'in_progress_tasks' => $user->tasks()->where('status', 'in progress')->count(),
            'completed_tasks' => $user->tasks()->where('status', 'completed')->count(),
            'approved_leaves' => $user->leaves()->where('status', 'approved')->count(),
            'pending_leaves' => $user->leaves()->where('status', 'pending')->count(),
        ];

        $todayAttendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today->toDateString())
            ->first();

        $recentTasks = $user->tasks()
            ->with('project')
            ->latest()
            ->take(5)
            ->get();

        // Activity Analytics for the current billing cycle (25th to 24th)
        $now = Carbon::now();
        if ($now->day >= 25) {
            $startDate = $now->copy()->day(25)->toDateString();
            $endDate = $now->copy()->addMonth()->day(24)->toDateString();
        } else {
            $startDate = $now->copy()->subMonth()->day(25)->toDateString();
            $endDate = $now->copy()->day(24)->toDateString();
        }

        $contentCalendarCount = ContentCalendar::whereBetween('date', [$startDate, $endDate])
            ->whereHas('assignees', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            })->count();

        $dailyWorksheetCount = DailyWorksheet::whereBetween('date', [$startDate, $endDate])
            ->where('user_id', $user->id)
            ->count();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'todayAttendance' => $todayAttendance,
            'recentTasks' => $recentTasks,
            'filteredStats' => [
                'content_calendar_count' => $contentCalendarCount,
                'daily_worksheet_count' => $dailyWorksheetCount,
            ],
        ]);
    }
}
