<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Leave;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class LeaveController extends Controller
{
    // Inertia page for listing leaves
    public function index()
    {
        $leaves = Leave::where('user_id', Auth::id())
                        ->orderBy('id', 'desc')
                        ->get();

        return inertia("User/Leaves/Index", [
            "leaves" => $leaves
        ]);
    }

    // Show apply leave page (UI form)
    public function create()
    {
        return inertia("User/Leaves/Create");
    }

    // Apply for leave (form POST)
    public function store(Request $request)
	{
	    $request->validate([
	        'type' => 'required|string',
	        'start_date' => 'required|date|after_or_equal:today',
	        'end_date' => 'required|date|after_or_equal:start_date',
	        'reason' => 'required|string',
	    ]);

	    $from = Carbon::parse($request->start_date);
	    $to = Carbon::parse($request->end_date);

	    // calculate days
	    $days = $from->diffInDays($to) + 1;

	    Leave::create([
	        'user_id' => auth()->id(),
	        'leave_type' => $request->type,
	        'from_date' => $from,
	        'to_date' => $to,
	        'no_of_days' => $days,
	        'reason' => $request->reason,
	        'status' => 'pending',
	    ]);

	    return redirect()->route('leave.index')
	        ->with('success', 'Leave applied successfully!');
	}
}
