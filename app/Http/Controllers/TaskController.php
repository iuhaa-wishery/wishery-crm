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
        $q = $request->input('q');

        $tasks = Task::where('assignee_id', auth()->id())
            ->when($q, fn($query) =>
                $query->where('name', 'like', "%{$q}%")
            )
            ->orderBy($request->input('sort', 'created_at'), $request->input('direction', 'desc'))
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Tasks/Index', [
            'tasks'   => $tasks,
            'filters' => $request->only(['q', 'sort', 'direction']),
        ]);
    }

    /**
     * Update only the status of a task (start / progress).
     */
    public function updateStatus(Request $request, Task $task)
    {
        if ($task->assignee_id !== auth()->id()) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'status' => 'required|in:not started,in progress,completed,on hold',
        ]);

        $task->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Task status updated.');
    }
}
