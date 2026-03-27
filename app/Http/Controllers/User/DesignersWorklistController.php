<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\DesignersWorklist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DesignersWorklistController extends Controller
{
    public function index(Request $request)
    {
        $query = DesignersWorklist::with(['creator', 'users'])
            ->whereHas('users', function ($q) {
                $q->where('users.id', auth()->id());
            });

        if ($request->filled('date')) {
            $query->whereDate('task_date', $request->date);
        }

        $worklists = $query->latest()->paginate(50);

        // Fetch task types from global settings
        $taskTypes = [];
        $globalSetting = \App\Models\Setting::where('key', 'designers_task_types')->value('value');
        if ($globalSetting) {
            $taskTypes = array_filter(array_map('trim', explode(',', $globalSetting)));
        }

        return Inertia::render('DesignersWorklist/Index', [
            'worklists' => $worklists,
            'taskTypes' => $taskTypes,
            'filters' => $request->only(['date']),
        ]);
    }

    public function updateStatus(Request $request, DesignersWorklist $designersWorklist)
    {
        // Ensure user can only update their own assigned tasks
        if (!$designersWorklist->users()->where('users.id', auth()->id())->exists()) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|string',
        ]);

        $designersWorklist->update([
            'status' => $request->status
        ]);

        return back()->with('success', 'Status updated successfully!');
    }
}
