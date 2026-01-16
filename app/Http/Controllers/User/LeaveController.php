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
			'leave_type' => 'required|string',
			'day_type' => 'required|in:full,first_half,second_half',
			'from_date' => 'required|date',
			'to_date' => 'required|date|after_or_equal:from_date',
			'reason' => 'required|string',
		]);

		$from = Carbon::parse($request->from_date);
		$to = Carbon::parse($request->to_date);

		// calculate days
		if ($request->day_type === 'full') {
			$days = $from->diffInDays($to) + 1;
		} else {
			// Half day is always 0.5 days and must be same day
			$days = 0.5;
			$to = $from; // Force same day for half-day
		}

		Leave::create([
			'user_id' => auth()->id(),
			'leave_type' => $request->leave_type,
			'day_type' => $request->day_type,
			'from_date' => $from,
			'to_date' => $to,
			'no_of_days' => $days,
			'reason' => $request->reason,
			'status' => 'pending',
		]);

		return redirect()->route('leave.index')
			->with('success', 'Leave applied successfully!');
	}

	public function destroy(Leave $leave)
	{
		// Ensure the leave belongs to the authenticated user and is pending
		if ($leave->user_id !== Auth::id()) {
			return back()->with('error', 'Unauthorized action.');
		}

		if ($leave->status !== 'pending') {
			return back()->with('error', 'Only pending leaves can be cancelled.');
		}

		$leave->delete();

		return redirect()->route('leave.index')
			->with('success', 'Leave application cancelled successfully!');
	}
}
