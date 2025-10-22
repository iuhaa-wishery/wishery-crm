<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Fetch projects where this user has tasks assigned
        $projects = Project::with(['tasks' => function ($query) use ($user) {
            $query->where('assignee_id', $user->id);
        }])
        ->whereHas('tasks', function ($query) use ($user) {
            $query->where('assignee_id', $user->id);
        })
        ->latest()
        ->get();

        return Inertia::render('User/Projects/Index', [
            'projects' => $projects,
        ]);
    }
}
