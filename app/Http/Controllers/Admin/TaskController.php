<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::with(['project', 'assignee'])->latest()->paginate(10);
        $projects = Project::all();
        $users = User::all();

        return Inertia::render('Admin/Tasks/Index', [
            'tasks' => $tasks,
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'assignee_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:not started,in progress,on hold,completed',
            'priority' => 'required|in:low,medium,high',
        ]);

        Task::create($validated);

        return redirect()
            ->route('admin.projects.show', $validated['project_id'])
            ->with('success', 'Task created successfully.');
    }

    public function edit(Task $task)
    {
        $projects = Project::all();
        $users = User::all();

        return Inertia::render('Admin/Tasks/Edit', [
            'task' => $task->load(['project', 'assignee']),
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'assignee_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:not started,in progress,on hold,completed',
            'priority' => 'required|in:low,medium,high',
        ]);

        $task->update($validated);

        return redirect()->back()->with('success', 'Task updated successfully');
    }
    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->back()->with('success', 'Task deleted successfully.');
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:not started,in progress,on hold,completed',
        ]);

        $task = Task::findOrFail($id);
        $task->status = $request->status;
        $task->save();

        // ✅ Return to the same page with Inertia
        return redirect()->back()->with('success', 'Status updated successfully.');
    }
}
