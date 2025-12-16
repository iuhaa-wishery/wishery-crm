<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function status()
    {
        $today = Carbon::today();
        $user_id = Auth::id();

        $attendances = Attendance::where('user_id', $user_id)
            ->where('date', $today)
            ->get();

        $latestAttendance = $attendances->last();
        $totalMinutesToday = $attendances->sum('total_worked_minutes');

        return response()->json([
            'status' => $latestAttendance ? $latestAttendance->status : 'not_started',
            'attendance' => $latestAttendance,
            'total_worked_minutes_today' => $totalMinutesToday,
            'now' => Carbon::now(),
        ]);
    }

    public function punchIn()
    {
        // Always create a new record for a new session
        Attendance::create([
            'user_id' => Auth::id(),
            'date' => Carbon::today(),
            'punch_in' => Carbon::now(),
            'status' => 'punched_in',
        ]);

        return back();
    }

    public function punchOut()
    {
        // Find the latest active session
        $attendance = Attendance::where('user_id', Auth::id())
            ->where('date', Carbon::today())
            ->where('status', '!=', 'punched_out')
            ->latest()
            ->first();

        if ($attendance && $attendance->punch_in) {
            $punchIn = Carbon::parse($attendance->punch_in);
            // Subtract break time from this session's duration
            $totalBreakMinutes = $attendance->total_break_minutes ?? 0;
            $duration = $punchIn->diffInMinutes(Carbon::now()) - $totalBreakMinutes;

            $attendance->update([
                'punch_out' => Carbon::now(),
                'total_worked_minutes' => max(0, $duration), // Ensure non-negative
                'status' => 'punched_out',
            ]);
        }

        return back();
    }

    public function startBreak()
    {
        $attendance = Attendance::where('user_id', Auth::id())
            ->where('date', Carbon::today())
            ->where('status', 'punched_in')
            ->latest()
            ->first();

        if ($attendance) {
            $attendance->update([
                'break_start' => Carbon::now(),
                'status' => 'on_break',
            ]);
        }

        return back();
    }

    public function endBreak()
    {
        $attendance = Attendance::where('user_id', Auth::id())
            ->where('date', Carbon::today())
            ->where('status', 'on_break')
            ->latest()
            ->first();

        if ($attendance && $attendance->break_start) {
            $breakStart = Carbon::parse($attendance->break_start);
            $breakDuration = $breakStart->diffInMinutes(Carbon::now());

            $attendance->update([
                'break_start' => null, // Clear break start for next break
                'break_end' => Carbon::now(), // Optional: keep last break end
                'total_break_minutes' => $attendance->total_break_minutes + $breakDuration,
                'status' => 'punched_in',
            ]);
        }

        return back();
    }

    public function index(Request $request)
    {
        $query = Attendance::with('user');

        if ($request->has('date') && $request->date) {
            $query->where('date', $request->date);
        }

        if ($request->has('month') && $request->month) {
            $date = Carbon::parse($request->month);
            $query->whereYear('date', $date->year)
                ->whereMonth('date', $date->month);
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        // Calculate total worked minutes for the filtered results
        $totalWorkedMinutes = $query->sum('total_worked_minutes');

        $attendances = $query->orderBy('date', 'desc')->orderBy('created_at', 'desc')->paginate(20);

        // Fetch all users for the filter dropdown
        $users = \App\Models\User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Attendance/Index', [
            'attendances' => $attendances,
            'users' => $users,
            'totalWorkedMinutes' => $totalWorkedMinutes,
            'filters' => $request->only(['date', 'month', 'user_id']),
        ]);
    }
}
