<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Leave;
use App\Models\ContentCalendar;
use App\Models\DailyWorksheet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $month = request('month', now()->month);
        $year = request('year', now()->year);
        $userId = request('user_id');

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

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'users' => $users,
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
