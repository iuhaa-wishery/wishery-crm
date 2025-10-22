<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
{
    $query = Project::query();

    if ($search = $request->input('search')) {
        $query->where('name', 'like', "%{$search}%");
    }

    $sort = $request->input('sort', 'name');
    $direction = $request->input('direction', 'asc');

    // whitelist columns to avoid SQL injection
    $allowed = ['id','name','status','start_date','end_date'];
    if (! in_array($sort, $allowed)) {
        $sort = 'name';
    }

    $perPage = (int) $request->input('perPage', 10);
    $projects = $query->orderBy($sort, $direction)->paginate($perPage)->withQueryString();

    return Inertia::render('Admin/Projects/Index', [
        'projects' => $projects,
        'filters' => $request->only(['search','perPage','sort','direction']),
        'success' => session('success'),
    ]);
}


    public function create()
    {
        return Inertia::render('Admin/Projects/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        Project::create($request->all());

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project created successfully!');
    }

    public function edit(Project $project)
    {
        return Inertia::render('Admin/Projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
	{
	    $request->validate([
	        'name' => 'required|string|max:255',
	        'description' => 'nullable|string',
	        'status' => 'required|string',
	        'start_date' => 'required|date',
	        'end_date' => 'required|date|after_or_equal:start_date',
	    ]);

	    $project->update($request->all());

	    if ($request->inertia()) {
	        return back()->with('success', 'Project updated successfully!');
	    }

	    return redirect()->route('admin.projects.index')
	        ->with('success', 'Project updated successfully!');
	}


    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('admin.projects.index')
            ->with('success', 'Project deleted successfully!');
    }

    public function show(Project $project)
    {
        $tasks = Task::with('assignee')
            ->where('project_id', $project->id)
            ->get();

        $users = User::all();

        return Inertia::render('Admin/Projects/Show', [
            'project' => $project,
            'tasks'   => $tasks,
            'users'   => $users,
        ]);
    }

    public function reorder(Request $request, Project $project)
	{
	    foreach ($request->all() as $status => $taskIds) {
	        foreach ($taskIds as $index => $taskId) {
	            Task::where('id', $taskId)
	                ->where('project_id', $project->id)
	                ->update([
	                    'status' => $status,
	                ]);
	        }
	    }

	    return back()->with('success', 'Tasks reordered successfully!');
	}
}
