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
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tasks = Task::with(['project', 'assignees'])->latest()->get();
        $projects = Project::all();
        $users = User::all();

        return Inertia::render('Admin/Tasks/Index', [
            'tasks' => $tasks,
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new task.
     */
    public function create()
    {
        $projects = Project::all();
        $users = User::all();

        return Inertia::render('Admin/Tasks/Create', [
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    // In TaskController.php

// ... (Other methods)

/**
 * Store a newly created task in storage.
 */
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'project_id' => 'required|exists:projects,id',
        'start_date' => 'nullable|date',
        'end_date' => 'nullable|date|after_or_equal:start_date',
        'status' => 'required|string|in:not started,in progress,on hold,completed', // Use the values from your JS: not started, in progress, on hold, completed
        'priority' => 'required|string|in:low,medium,high',
        'assignee_ids' => 'nullable|array',
        'assignee_ids.*' => 'exists:users,id',
    ]);

    // Create the task
    $task = Task::create($request->only([
        'name', 'description', 'project_id', 'start_date', 'end_date', 'status', 'priority',
    ]));

    // Attach multiple assignees via pivot table
    if (!empty($validated['assignee_ids'])) {
        $task->assignees()->sync($validated['assignee_ids']);
    }

    // --- 💡 KEY CHANGE: Return the updated task list ---
    $updatedTasks = Task::where('project_id', $validated['project_id'])
                        ->with('assignees') // Eager load the assignees
                        ->get();

    return Inertia::location(route('admin.projects.show', $validated['project_id'], [
        'tasks' => $updatedTasks,
    ]));

    // Alternatively, use Inertia::render if the original page is the Project Show page:
    // return Inertia::render('Admin/Projects/Show', [ 
    //     'tasks' => $updatedTasks,
    // ])->with('success', 'Task created successfully.');
}

// ... (Other methods)

/**
 * Update the specified task in storage.
 */
public function update(Request $request, Task $task)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'project_id' => 'required|exists:projects,id',
        'start_date' => 'nullable|date',
        'end_date' => 'nullable|date|after_or_equal:start_date',
        'status' => 'required|string|in:not started,in progress,on hold,completed', // Use the values from your JS
        'priority' => 'required|string|in:low,medium,high',
        'assignee_ids' => 'nullable|array',
        'assignee_ids.*' => 'exists:users,id',
    ]);

    // Update base task details
    $task->update($request->only([
        'name', 'description', 'project_id', 'start_date', 'end_date', 'status', 'priority',
    ]));

    // Update pivot assignees
    // sync() handles adding/removing/updating the user IDs in the pivot table
    $task->assignees()->sync($validated['assignee_ids'] ?? []);

    // --- 💡 KEY CHANGE: Return the updated task list ---
    // Fetch all tasks for the project again, with the assignees loaded
    $updatedTasks = Task::where('project_id', $validated['project_id'])
                        ->with('assignees') // Eager load the assignees
                        ->get();

    // Send the updated tasks back to the frontend to refresh the Kanban board
    return Inertia::location(route('admin.projects.show', $validated['project_id'], [
        'tasks' => $updatedTasks,
    ]));
    
    // Using Inertia::location with a full URL parameter is sometimes necessary 
    // when submitting a form, but a simple redirect()->back() with a flash 
    // message and a full page Inertia reload is often the simplest fix. 
    // Let's stick with the simplest fix for form submission:
    
    /* return redirect()->route('admin.projects.show', $validated['project_id'])
                     ->with('success', 'Task updated successfully.');
    // And ensure the ProjectController@show is used by Inertia to fully refresh the data.
    */
    
    // Based on your JS using 'onSuccess' and checking page.props.tasks, 
    // the cleanest solution is to use Inertia::location with the updated tasks:
    
    // return redirect()->route('admin.projects.show', $validated['project_id'])
    //                  ->with('success', 'Task updated successfully.');
    // Let's assume the client-side `router.post` with `preserveScroll: true` 
    // expects the full data back if it's not redirecting.

    // FINAL SUGGESTION: Change your JS request to simply use `router.reload()` on success
    // OR ensure the ProjectController@show is correctly loading tasks/assignees.
    // However, if you must return data, this is the way:
    return redirect()->route('admin.projects.show', $validated['project_id'])->with([
        'success' => 'Task updated successfully.',
        'tasks' => $updatedTasks->toArray(),
    ]);

    // Due to the complexity of Inertia props, a simple `redirect()->back()` 
    // forcing a full reload of the `ProjectController@show` is usually best 
    // for `store`/`update` actions that affect a major view list.
}

    /**
     * Show the form for editing a task.
     */
    public function edit(Task $task)
    {
        $task->load(['project', 'assignees']);
        $projects = Project::all();
        $users = User::all();

        return Inertia::render('Admin/Tasks/Edit', [
            'task' => $task,
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    /**
     * Remove the specified task from storage.
     */
    public function destroy(Task $task)
    {
        $projectId = $task->project_id;

        // Detach all users from pivot before deleting task
        $task->assignees()->detach();
        $task->delete();

        return redirect()->route('admin.projects.show', $projectId)
                         ->with('success', 'Task deleted successfully.');
    }
}
