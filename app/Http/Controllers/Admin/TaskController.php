<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;

class TaskController extends Controller // Assuming you renamed this to AdminTaskController based on your route prefix
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
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
            'assignee_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:not started,in progress,on hold,completed',
            'priority' => 'required|in:low,medium,high',
        ]);

        Task::create($validated);

        // We redirect here because the task was created on a modal overlaying the project page.
        // Inertia handles this redirect correctly.
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

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assignee_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:not started,in progress,on hold,completed',
            'priority' => 'required|in:low,medium,high',
        ]);

        $task->update($validated);

        // Returning back() is okay here for the modal edit, as Inertia handles it.
        return redirect()->back()->with('success', 'Task updated successfully');
    }
    
    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->back()->with('success', 'Task deleted successfully.');
    }

    /**
     * Updates the status of a task and returns the current page data to Inertia.
     * This avoids the redirect loop.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:not started,in progress,on hold,completed',
        ]);

        $task = Task::findOrFail($id);
        $task->status = $request->status;
        $task->save();

        // ✅ FINAL FIX: Return a simple JSON success response (HTTP 200).
        // This prevents any redirects and stops the middleware loop.
        return Response::json([
            'message' => 'Task status updated successfully.'
        ], 200); 
    }
}