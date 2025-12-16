<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Task::with(['project', 'assignees']);

        // If not admin/manager, only show assigned tasks
        if (!in_array($user->role, ['admin', 'manager'])) {
            $query->whereHas('assignees', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Optional: Filter by project if needed in the future
        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        $tasks = $query->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->name,
                'start' => $task->start_date ?? $task->created_at, // Fallback if no start date
                'end' => $task->end_date ?? $task->start_date ?? $task->created_at,
                'allDay' => true, // Or calculate based on time
                'resource' => $task, // Pass full task object for details
                'status' => $task->status,
                'priority' => $task->priority,
                'project_color' => $this->getProjectColor($task->project_id),
            ];
        });

        return Inertia::render('Calendar/Index', [
            'tasks' => $tasks,
            'projects' => Project::all(), // For the "Add Task" modal
            'users' => User::all(),       // For the "Add Task" modal
        ]);
    }

    private function getProjectColor($projectId)
    {
        // Simple hash to color function or predefined colors
        $colors = [
            '#3B82F6',
            '#EF4444',
            '#10B981',
            '#F59E0B',
            '#8B5CF6',
            '#EC4899',
            '#6366F1'
        ];
        return $colors[$projectId % count($colors)] ?? '#3B82F6';
    }
}
