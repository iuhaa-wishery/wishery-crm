<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Leave;
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

    public function punchIn(Request $request)
    {
        $today = Carbon::today();
        $userId = Auth::id();

        // Check if attendance already exists for today
        $attendance = Attendance::where('user_id', $userId)
            ->where('date', $today)
            ->first();

        if ($attendance) {
            if ($attendance->status === 'punched_out') {
                return back()->with('error', 'You have already completed your work for today.');
            }
            // If already punched in or on break, just return (idempotent)
            return back();
        }

        // Create new attendance
        Attendance::create([
            'user_id' => $userId,
            'date' => $today,
            'punch_in' => Carbon::now(),
            'punch_in_lat' => $request->latitude,
            'punch_in_lng' => $request->longitude,
            'status' => 'punched_in',
        ]);

        return back();
    }

    public function punchOut(Request $request)
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
                'punch_out_lat' => $request->latitude,
                'punch_out_lng' => $request->longitude,
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
        $users = \App\Models\User::where('role', '!=', 'admin')->orderBy('name')->get();
        $filters = $request->only(['date', 'month', 'user_id']);

        // Mode 1: Monthly View (Month selected OR no date selected)
        if ($request->filled('month') || !$request->filled('date')) {
            $monthStr = $request->input('month', Carbon::now()->format('Y-m'));
            $month = Carbon::parse($monthStr);

            // Default to first user if not selected
            $userId = $request->user_id;
            if (!$userId && $users->isNotEmpty()) {
                $userId = $users->first()->id;
                // Update filters to reflect the auto-selected user
                $filters['user_id'] = $userId;
            }

            if (!isset($filters['month'])) {
                $filters['month'] = $monthStr;
            }

            if ($userId) {
                $attendances = Attendance::where('user_id', $userId)
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->orderBy('date', 'desc')
                    ->get();

                $totalMonthlyMinutes = $attendances->sum('total_worked_minutes');

                $attendanceData = $attendances->map(function ($attendance) {
                    $checkInTime = Carbon::parse($attendance->punch_in);
                    $dateString = $attendance->date instanceof \Carbon\Carbon ? $attendance->date->format('Y-m-d') : $attendance->date;
                    $nineAM = Carbon::parse($dateString . ' 09:00:00');
                    $nineThirtyAM = Carbon::parse($dateString . ' 09:30:00');
                    $sixPM = Carbon::parse($dateString . ' 18:00:00');

                    $isLate = $checkInTime->gt($nineThirtyAM);
                    $isEarlyLeave = $attendance->punch_out && Carbon::parse($attendance->punch_out)->lt($sixPM);

                    $status = 'Present';
                    if ($isLate && $isEarlyLeave) {
                        $status = 'Late & Early Leave';
                    } elseif ($isLate) {
                        $status = 'Late';
                    } elseif ($isEarlyLeave) {
                        $status = 'Early Leave';
                    }

                    if ($attendance->status === 'punched_in' || $attendance->status === 'on_break') {
                        // Status is already tracked
                    }

                    return [
                        'id' => $attendance->id,
                        'date' => $attendance->date,
                        'check_in' => $attendance->punch_in ? Carbon::parse($attendance->punch_in)->format('h:i A') : '-',
                        'check_out' => $attendance->punch_out ? Carbon::parse($attendance->punch_out)->format('h:i A') : '-',
                        'status' => $status,
                        'hours' => floor($attendance->total_worked_minutes / 60) . 'h ' . ($attendance->total_worked_minutes % 60) . 'm',
                        'break_time' => floor(($attendance->total_break_minutes ?? 0) / 60) . 'h ' . (($attendance->total_break_minutes ?? 0) % 60) . 'm',
                        'attendance_id' => $attendance->id,
                        'punch_in_raw' => $attendance->punch_in,
                        'punch_out_raw' => $attendance->punch_out,
                        'punch_in_lat' => $attendance->punch_in_lat,
                        'punch_in_lng' => $attendance->punch_in_lng,
                        'punch_out_lat' => $attendance->punch_out_lat,
                        'punch_out_lng' => $attendance->punch_out_lng,
                    ];
                });

                $leaves = Leave::where('user_id', $userId)
                    ->where('status', 'approved')
                    ->where(function ($query) use ($month) {
                        $query->whereBetween('from_date', [$month->startOfMonth()->toDateString(), $month->endOfMonth()->toDateString()])
                            ->orWhereBetween('to_date', [$month->startOfMonth()->toDateString(), $month->endOfMonth()->toDateString()]);
                    })
                    ->get();

                return Inertia::render('Admin/Attendance/Index', [
                    'attendanceData' => $attendanceData,
                    'users' => $users,
                    'filters' => $filters,
                    'viewType' => 'monthly',
                    'totalMonthlyMinutes' => $totalMonthlyMinutes,
                    'selectedUser' => $users->find($userId),
                    'leaves' => $leaves,
                ]);
            }
        }

        // Mode 2: Daily View (All Users for Specific Date)
        $date = $request->input('date', Carbon::today()->toDateString());
        $userId = $request->user_id;

        $filteredUsers = $users;
        if ($userId) {
            $filteredUsers = $users->where('id', $userId);
        }

        // Fetch attendances for the selected date
        $attendances = Attendance::where('date', $date)->get()->keyBy('user_id');

        // Map users to their attendance and calculate status
        $attendanceData = $filteredUsers->map(function ($user) use ($attendances) {
            $attendance = $attendances->get($user->id);
            $status = 'Absent';
            $checkIn = '-';
            $checkOut = '-';
            $hours = '-';

            if ($attendance) {
                $checkInTime = Carbon::parse($attendance->punch_in);
                $checkIn = $checkInTime->format('h:i A');

                if ($attendance->punch_out) {
                    $checkOut = Carbon::parse($attendance->punch_out)->format('h:i A');
                }

                // Calculate Status
                $dateString = $attendance->date instanceof \Carbon\Carbon ? $attendance->date->format('Y-m-d') : $attendance->date;
                $nineAM = Carbon::parse($dateString . ' 09:00:00');
                $nineThirtyAM = Carbon::parse($dateString . ' 09:30:00');
                $sixPM = Carbon::parse($dateString . ' 18:00:00');

                $isLate = $checkInTime->gt($nineThirtyAM);
                $isEarlyLeave = $attendance->punch_out && Carbon::parse($attendance->punch_out)->lt($sixPM);

                $status = 'Present';
                if ($isLate && $isEarlyLeave) {
                    $status = 'Late & Early Leave';
                } elseif ($isLate) {
                    $status = 'Late';
                } elseif ($isEarlyLeave) {
                    $status = 'Early Leave';
                }

                // Calculate Hours
                $hours = floor($attendance->total_worked_minutes / 60) . 'h ' . ($attendance->total_worked_minutes % 60) . 'm';
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'date' => $attendance ? $attendance->date : null,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'status' => $status,
                'hours' => $hours,
                'break_time' => $attendance ? floor(($attendance->total_break_minutes ?? 0) / 60) . 'h ' . (($attendance->total_break_minutes ?? 0) % 60) . 'm' : '-',
                'attendance_id' => $attendance ? $attendance->id : null,
                'punch_in_raw' => $attendance ? $attendance->punch_in : null,
                'punch_out_raw' => $attendance ? $attendance->punch_out : null,
                'punch_in_lat' => $attendance ? $attendance->punch_in_lat : null,
                'punch_in_lng' => $attendance ? $attendance->punch_in_lng : null,
                'punch_out_lat' => $attendance ? $attendance->punch_out_lat : null,
                'punch_out_lng' => $attendance ? $attendance->punch_out_lng : null,
            ];
        });

        return Inertia::render('Admin/Attendance/Index', [
            'attendanceData' => $attendanceData,
            'users' => $users,
            'filters' => array_merge($filters, ['date' => $date]),
            'viewType' => 'daily',
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'punch_in' => 'required|date',
            'punch_out' => 'nullable|date|after_or_equal:punch_in',
        ]);

        $punchIn = Carbon::parse($request->punch_in);
        $punchOut = $request->punch_out ? Carbon::parse($request->punch_out) : null;

        // Find existing record for this user and date
        $attendance = Attendance::where('user_id', $request->user_id)
            ->where('date', $request->date)
            ->first();

        $totalBreakMinutes = $attendance ? ($attendance->total_break_minutes ?? 0) : 0;
        $totalWorkedMinutes = 0;

        if ($punchIn && $punchOut) {
            $totalWorkedMinutes = max(0, $punchIn->diffInMinutes($punchOut) - $totalBreakMinutes);
        }

        Attendance::updateOrCreate(
            ['user_id' => $request->user_id, 'date' => $request->date],
            [
                'punch_in' => $punchIn,
                'punch_out' => $punchOut,
                'total_worked_minutes' => $totalWorkedMinutes,
                'status' => $punchOut ? 'punched_out' : 'punched_in',
            ]
        );

        return back()->with('success', 'Attendance saved successfully.');
    }

    public function update(Request $request, Attendance $attendance)
    {
        $request->validate([
            'punch_in' => 'required|date',
            'punch_out' => 'nullable|date|after_or_equal:punch_in',
        ]);

        $punchIn = Carbon::parse($request->punch_in);
        $punchOut = $request->punch_out ? Carbon::parse($request->punch_out) : null;

        $totalBreakMinutes = $attendance->total_break_minutes ?? 0;
        $totalWorkedMinutes = 0;

        if ($punchIn && $punchOut) {
            $totalWorkedMinutes = max(0, $punchIn->diffInMinutes($punchOut) - $totalBreakMinutes);
        }

        $attendance->update([
            'punch_in' => $punchIn,
            'punch_out' => $punchOut,
            'total_worked_minutes' => $totalWorkedMinutes,
            'status' => $punchOut ? 'punched_out' : 'punched_in',
        ]);

        return back()->with('success', 'Attendance updated successfully.');
    }
    public function report(Request $request)
    {
        $userId = $request->input('user_id');
        $month = $request->input('month', Carbon::now()->format('Y-m'));

        $users = \App\Models\User::orderBy('name')->get(['id', 'name']);

        // Default to the first user if none selected
        if (!$userId && $users->isNotEmpty()) {
            $userId = $users->first()->id;
        }

        $attendances = [];
        $totalMonthlyMinutes = 0;
        $dailySummaries = [];

        if ($userId) {
            $date = Carbon::parse($month);

            $query = Attendance::where('user_id', $userId)
                ->whereYear('date', $date->year)
                ->whereMonth('date', $date->month)
                ->orderBy('date', 'desc')
                ->orderBy('punch_in', 'asc');

            $rawAttendances = $query->get();
            $totalMonthlyMinutes = $rawAttendances->sum('total_worked_minutes');

            // Group by date for the view
            foreach ($rawAttendances as $attendance) {
                // Ensure date is a string for array key
                $dateKey = $attendance->date instanceof \Carbon\Carbon ? $attendance->date->format('Y-m-d') : $attendance->date;

                if (!isset($dailySummaries[$dateKey])) {
                    $dailySummaries[$dateKey] = [
                        'date' => $dateKey,
                        'total_minutes' => 0,
                        'sessions' => []
                    ];
                }
                $dailySummaries[$dateKey]['total_minutes'] += $attendance->total_worked_minutes;
                $dailySummaries[$dateKey]['sessions'][] = $attendance;
            }

            // Convert to array and sort by date desc
            $attendances = array_values($dailySummaries);
        }

        return Inertia::render('Admin/Attendance/Report', [
            'users' => $users,
            'attendances' => $attendances,
            'totalMonthlyMinutes' => $totalMonthlyMinutes,
            'filters' => [
                'user_id' => $userId,
                'month' => $month,
            ],
        ]);
    }
}
