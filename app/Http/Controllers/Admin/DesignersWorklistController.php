<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesignersWorklist;
use App\Models\User;
use App\Models\DailyWorksheetSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DesignersWorklistController extends Controller
{
    public function index(Request $request)
    {
        $query = DesignersWorklist::with(['users', 'creator']);

        if ($search = $request->input('search')) {
            $query->where('client_name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        if ($date = $request->input('date')) {
            $query->whereDate('task_date', $date);
        }

        if ($userId = $request->input('user_id')) {
            $query->whereHas('users', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            });
        }

        $worklists = $query->latest()->paginate(10)->withQueryString();

        $users = User::whereIn('role', ['user', 'editor'])->get(['id', 'name']);

        // Fetch task types from global settings
        $taskTypes = [];
        $globalSetting = \App\Models\Setting::where('key', 'designers_task_types')->value('value');
        if ($globalSetting) {
            $taskTypes = array_filter(array_map('trim', explode(',', $globalSetting)));
        }

        return Inertia::render('Admin/DesignersWorklist/Index', [
            'worklists' => $worklists,
            'users' => $users,
            'taskTypes' => $taskTypes,
            'filters' => $request->only(['search', 'user_id', 'date']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'task_date' => 'required|date',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'task_type' => 'required|string',
            'description' => 'required|string',
            'status' => 'required|string',
        ]);

        $validated['creator_id'] = auth()->id();

        $worklist = DesignersWorklist::create([
            'client_name' => $validated['client_name'],
            'task_date' => $validated['task_date'],
            'creator_id' => $validated['creator_id'],
            'task_type' => $validated['task_type'],
            'description' => $validated['description'],
            'status' => $validated['status'],
        ]);

        $worklist->users()->sync($validated['user_ids']);

        return back()->with('success', 'Task assigned successfully!');
    }

    public function update(Request $request, DesignersWorklist $designersWorklist)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'task_date' => 'required|date',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'task_type' => 'required|string',
            'description' => 'required|string',
            'status' => 'required|string',
        ]);

        $designersWorklist->update([
            'client_name' => $validated['client_name'],
            'task_date' => $validated['task_date'],
            'task_type' => $validated['task_type'],
            'description' => $validated['description'],
            'status' => $validated['status'],
        ]);

        $designersWorklist->users()->sync($validated['user_ids']);

        return back()->with('success', 'Task updated successfully!');
    }

    public function destroy(DesignersWorklist $designersWorklist)
    {
        $designersWorklist->delete();
        return back()->with('success', 'Task deleted successfully!');
    }
}
