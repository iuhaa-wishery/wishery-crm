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

        $worklists = $query->latest('task_date')->paginate(10);

        return Inertia::render('DesignersWorklist/Index', [
            'worklists' => $worklists,
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
