<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    /**
     * Display logged-in user’s tasks.
     */
    public function index(Request $request)
    {
        if (auth()->user()->role === 'manager') {
            return redirect()->route('admin.tasks.index');
        }

        $q = $request->input('q');
        $projectId = $request->input('project_id'); // 💡 GET THE PROJECT ID
        $userId = auth()->id();

        $tasks = Task::with('project')
            // 1. Filter by Assignee (using the correct pivot table logic)
            ->whereHas('assignees', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })

            // 💡 2. FIX: Filter by Project ID if provided
            ->when(
                $projectId,
                fn($query) =>
                $query->where('project_id', $projectId)
            )

            // 3. Filter by Search Query
            ->when(
                $q,
                fn($query) =>
                $query->where('name', 'like', "%{$q}%")
            )
            ->orderBy($request->input('sort', 'created_at'), $request->input('direction', 'desc'))
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('User/Tasks/Index', [
            'tasks' => $tasks,
            'filters' => $request->only(['q', 'sort', 'direction', 'project_id']), // Include project_id in filters
        ]);
    }

    /**
     * Update only the status of a task (start / progress).
     */
    public function updateStatus(Request $request, Task $task)
    {
        $userId = auth()->id();

        // 💡 FIX 2: Check if the current user is an assignee of this task
        $isAssignee = $task->assignees()
            ->where('user_id', $userId)
            ->exists();

        if (!$isAssignee) {
            // Log this for debugging
            \Log::warning("Unauthorized task update attempt for task {$task->id} by user " . $userId);
            abort(403, 'Unauthorized. You are not assigned to this task.');
        }

        $request->validate([
            'status' => 'required|in:not started,in progress,completed,on hold',
        ]);

        $task->update(['status' => $request->status]);

        return back()->with('message', 'Task status updated');
    }
}
