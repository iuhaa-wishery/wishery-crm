<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
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
        $month = request('month', now()->month);
        $year = request('year', now()->year);
        $userId = auth()->user()->role === 'admin' ? request('user_id') : auth()->id();

        $stats = [
            'total_users' => auth()->user()->role === 'admin' ? User::where('role', 'user')->count() : 0,
            'pending_leaves' => auth()->user()->role === 'admin' ? Leave::where('status', 'pending')->count() : 0,
        ];

        // Fetch users for filtering
        $users = User::where('role', 'user')->orderBy('name')->get(['id', 'name']);

        // Filtered counts for Content Calendar
        $contentCalendarQuery = ContentCalendar::whereYear('date', $year)
            ->whereMonth('date', $month);

        if ($userId) {
            $contentCalendarQuery->whereHas('assignees', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            });
        }
        $contentCalendarCount = $contentCalendarQuery->count();

        // Filtered counts for Daily Worksheet
        $dailyWorksheetQuery = DailyWorksheet::whereYear('date', $year)
            ->whereMonth('date', $month);

        if ($userId) {
            $dailyWorksheetQuery->where('user_id', $userId);
        }
        $dailyWorksheetCount = $dailyWorksheetQuery->count();

        $todayAttendance = Attendance::where('user_id', auth()->id())
            ->whereDate('date', Carbon::today()->toDateString())
            ->first();

        // personal tasks/stats for admins/editors/managers (since they are also users)
        $user = auth()->user();
        $personalStats = [
            'total_tasks' => $user->tasks()->count(),
            'pending_tasks' => $user->tasks()->where('status', 'pending')->count(),
            'in_progress_tasks' => $user->tasks()->where('status', 'in progress')->count(),
            'completed_tasks' => $user->tasks()->where('status', 'completed')->count(),
        ];

        $recentTasks = $user->tasks()
            ->with('project')
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'users' => $users,
            'todayAttendance' => $todayAttendance,
            'personalStats' => $personalStats,
            'recentTasks' => $recentTasks,
            'filteredStats' => [
                'content_calendar_count' => $contentCalendarCount,
                'daily_worksheet_count' => $dailyWorksheetCount,
            ],
            'filters' => [
                'month' => (int) $month,
                'year' => (int) $year,
                'user_id' => $userId ? (int) $userId : null,
            ],
        ]);
    }
}
