<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use App\Models\Leave;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_projects' => Project::count(),
            'total_tasks' => Task::count(),
            'total_users' => auth()->user()->role === 'admin' ? User::where('role', 'user')->count() : 0,
            'pending_leaves' => auth()->user()->role === 'admin' ? Leave::where('status', 'pending')->count() : 0,
        ];

        $projectStatusStats = Project::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        $taskPriorityStats = Task::selectRaw('priority, count(*) as count')
            ->groupBy('priority')
            ->get()
            ->pluck('count', 'priority');

        $recentProjects = Project::latest()->take(5)->get();
        $recentTasks = Task::with('project')->latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'projectStatusStats' => $projectStatusStats,
            'taskPriorityStats' => $taskPriorityStats,
            'recentProjects' => $recentProjects,
            'recentTasks' => $recentTasks,
        ]);
    }
}
