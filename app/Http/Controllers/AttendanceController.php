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
            ->with('breaks')
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

        // Enforce Location
        if (!$request->latitude || !$request->longitude) {
            return back()->with('error', 'Location is mandatory to punch in. Please allow location access.');
        }

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

        // Detect Device Type
        $userAgent = $request->header('User-Agent');
        $deviceType = 'Desktop';
        if (preg_match('/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/', $userAgent)) {
            $deviceType = 'Mobile';
        }

        // Restrict if user is set to Desktop Only
        if (Auth::user()->desktop_only && $deviceType === 'Mobile') {
            return back()->with('error', 'You are restricted to punch in from Desktop only.');
        }

        // Create new attendance
        Attendance::create([
            'user_id' => $userId,
            'date' => $today,
            'punch_in' => Carbon::now(),
            'punch_in_lat' => $request->latitude,
            'punch_in_lng' => $request->longitude,
            'status' => 'punched_in',
            'device_type' => $deviceType,
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
            // Detect Device Type
            $userAgent = $request->header('User-Agent');
            $deviceType = 'Desktop';
            if (preg_match('/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/', $userAgent)) {
                $deviceType = 'Mobile';
            }

            // Restrict if user is set to Desktop Only
            if (Auth::user()->desktop_only && $deviceType === 'Mobile') {
                return back()->with('error', 'You are restricted to punch out from Desktop only.');
            }

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
            // Create a new break record
            \App\Models\AttendanceBreak::create([
                'attendance_id' => $attendance->id,
                'start_time' => Carbon::now(),
            ]);

            $attendance->update([
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

        if ($attendance) {
            // Find the active break
            $activeBreak = \App\Models\AttendanceBreak::where('attendance_id', $attendance->id)
                ->whereNull('end_time')
                ->latest()
                ->first();

            if ($activeBreak) {
                $now = Carbon::now();
                $breakStart = Carbon::parse($activeBreak->start_time);
                $duration = $breakStart->diffInMinutes($now);

                $activeBreak->update([
                    'end_time' => $now,
                    'total_minutes' => $duration,
                ]);

                // Update total break minutes on the parent attendance
                $totalBreak = \App\Models\AttendanceBreak::where('attendance_id', $attendance->id)
                    ->sum('total_minutes');

                $attendance->update([
                    'total_break_minutes' => $totalBreak,
                    'status' => 'punched_in',
                    // 'break_start' is no longer really needed on the parent, but we can keep it null for compatibility if needed
                    // or just ignore it. The original code set it to null.
                    'break_start' => null,
                ]);
            } else {
                // Fallback if no break record found but status is on_break (legacy/error state)
                $attendance->update(['status' => 'punched_in']);
            }
        }

        return back();
    }

    public function index(Request $request)
    {
        $users = \App\Models\User::whereNotIn('role', ['admin', 'manager'])->orderBy('name')->get();
        $filters = $request->only(['date', 'month', 'user_id', 'display']);

        // Mode 1: Monthly View (Month selected OR no date selected OR Calendar Display forced)
        if ($request->filled('month') || !$request->filled('date') || $request->input('display') === 'calendar') {
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
                // Get all attendance records for the month
                $attendances = Attendance::where('user_id', $userId)
                    ->whereYear('date', $month->year)
                    ->whereMonth('date', $month->month)
                    ->with('breaks')
                    ->get()
                    ->keyBy(function ($item) {
                        return $item->date instanceof \Carbon\Carbon ? $item->date->format('Y-m-d') : $item->date;
                    });

                // Get approved leaves for the month
                $leaves = Leave::where('user_id', $userId)
                    ->where('status', 'approved')
                    ->where(function ($query) use ($month) {
                        $query->whereBetween('from_date', [$month->copy()->startOfMonth()->toDateString(), $month->copy()->endOfMonth()->toDateString()])
                            ->orWhereBetween('to_date', [$month->copy()->startOfMonth()->toDateString(), $month->copy()->endOfMonth()->toDateString()]);
                    })
                    ->get();

                $totalMonthlyMinutes = $attendances->sum('total_worked_minutes');

                // Generate all dates for the month
                $startDate = $month->copy()->startOfMonth();
                $realEndDate = $month->copy()->endOfMonth();
                $today = Carbon::today();

                // Don't show future days beyond today
                $endDate = $realEndDate->gt($today) ? $today : $realEndDate;

                $attendanceData = [];

                for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
                    $dateStr = $date->toDateString();
                    $attendance = $attendances->get($dateStr);

                    $status = '-';
                    $checkIn = '-';
                    $checkOut = '-';
                    $hours = '-';
                    $breakTime = '-';
                    $attendanceId = null;
                    $punchInRaw = null;
                    $punchOutRaw = null;
                    $punchInLat = null;
                    $punchInLng = null;
                    $punchOutLat = null;
                    $punchOutLng = null;
                    $deviceType = null;
                    $currentStatus = '-';
                    $dbStatus = null;
                    $breaks = [];

                    if ($attendance) {
                        $attendanceId = $attendance->id;
                        $punchInRaw = $attendance->punch_in;
                        $punchOutRaw = $attendance->punch_out;
                        $punchInLat = $attendance->punch_in_lat;
                        $punchInLng = $attendance->punch_in_lng;
                        $punchOutLat = $attendance->punch_out_lat;
                        $punchOutLng = $attendance->punch_out_lng;
                        $deviceType = $attendance->device_type;
                        $dbStatus = $attendance->status;
                        $breaks = $attendance->breaks;

                        // Calculate Current Status
                        $currentStatus = '-';
                        if ($attendance->date instanceof \Carbon\Carbon ? $attendance->date->isToday() : $attendance->date === Carbon::today()->toDateString()) {
                            if ($dbStatus === 'punched_in')
                                $currentStatus = 'Working';
                            elseif ($dbStatus === 'on_break')
                                $currentStatus = 'Break';
                            elseif ($dbStatus === 'punched_out')
                                $currentStatus = 'Punched Out';
                        } else {
                            $currentStatus = $attendance->punch_out ? 'Punched Out' : '-';
                        }

                        // Calculate real-time break minutes including ongoing breaks
                        $totalBreakMinutes = $attendance->total_break_minutes ?? 0;
                        $activeBreak = $breaks->whereNull('end_time')->first();
                        if ($activeBreak) {
                            $totalBreakMinutes += Carbon::parse($activeBreak->start_time)->diffInMinutes(Carbon::now());
                        }

                        $checkInTime = Carbon::parse($attendance->punch_in);
                        $dateString = $attendance->date instanceof \Carbon\Carbon ? $attendance->date->format('Y-m-d') : $attendance->date;
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

                        $checkIn = $attendance->punch_in ? Carbon::parse($attendance->punch_in)->format('h:i A') : '-';
                        $checkOut = $attendance->punch_out ? Carbon::parse($attendance->punch_out)->format('h:i A') : '-';
                        $hours = floor($attendance->total_worked_minutes / 60) . 'h ' . ($attendance->total_worked_minutes % 60) . 'm';
                        $breakTime = floor($totalBreakMinutes / 60) . 'h ' . ($totalBreakMinutes % 60) . 'm';
                    } else {
                        // Check if it's a Saturday or Sunday
                        if ($date->isSaturday() || $date->isSunday()) {
                            $status = 'OFF';
                        } else {
                            // Check for Leaves
                            $isOnLeave = $leaves->filter(function ($leave) use ($dateStr) {
                                return $dateStr >= $leave->from_date && $dateStr <= $leave->to_date;
                            })->first();

                            if ($isOnLeave) {
                                $status = 'Leave';
                            } elseif ($date->lt($today)) {
                                $status = 'Absent';
                            }
                        }
                    }

                    $attendanceData[] = [
                        'id' => $attendanceId ?? $dateStr,
                        'date' => $dateStr,
                        'check_in' => $checkIn,
                        'check_out' => $checkOut,
                        'status' => $status,
                        'hours' => $hours,
                        'break_time' => $breakTime,
                        'attendance_id' => $attendanceId,
                        'punch_in_raw' => $punchInRaw,
                        'punch_out_raw' => $punchOutRaw,
                        'punch_in_lat' => $punchInLat,
                        'punch_in_lng' => $punchInLng,
                        'punch_out_lat' => $punchOutLat,
                        'punch_out_lng' => $punchOutLng,
                        'device_type' => $deviceType,
                        'db_status' => $dbStatus ?? null,
                        'current_status' => $currentStatus,
                        'breaks' => $breaks ?? [],
                    ];
                }

                // Reverse to show most recent first (like it was before)
                $attendanceData = array_reverse($attendanceData);

                $settings = \App\Models\Setting::all()->pluck('value', 'key');

                return Inertia::render('Admin/Attendance/Index', [
                    'attendanceData' => $attendanceData,
                    'users' => $users,
                    'filters' => $filters,
                    'viewType' => 'monthly',
                    'totalMonthlyMinutes' => $totalMonthlyMinutes,
                    'selectedUser' => $users->find($userId),
                    'leaves' => $leaves,
                    'settings' => $settings,
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
        $attendances = Attendance::where('date', $date)->with('breaks')->get()->keyBy('user_id');

        // Map users to their attendance and calculate status
        $attendanceData = $filteredUsers->map(function ($user) use ($attendances, $date) {
            $attendance = $attendances->get($user->id);
            $status = 'Absent';
            $checkIn = '-';
            $checkOut = '-';
            $hours = '-';

            $dbStatus = $attendance ? $attendance->status : null;
            $breaks = $attendance ? $attendance->breaks : collect([]);

            // Calculate Current Status
            $currentStatus = '-';
            if ($attendance && $date === Carbon::today()->toDateString()) {
                if ($dbStatus === 'punched_in')
                    $currentStatus = 'Working';
                elseif ($dbStatus === 'on_break')
                    $currentStatus = 'Break';
                elseif ($dbStatus === 'punched_out')
                    $currentStatus = 'Punched Out';
            } elseif ($attendance) {
                $currentStatus = $attendance->punch_out ? 'Punched Out' : '-';
            }

            // Real-time break calculation
            $totalBreakMinutes = $attendance ? ($attendance->total_break_minutes ?? 0) : 0;
            $activeBreak = $breaks->whereNull('end_time')->first();
            if ($activeBreak) {
                $totalBreakMinutes += Carbon::parse($activeBreak->start_time)->diffInMinutes(Carbon::now());
            }

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
                'break_time' => floor($totalBreakMinutes / 60) . 'h ' . ($totalBreakMinutes % 60) . 'm',
                'attendance_id' => $attendance ? $attendance->id : null,
                'punch_in_raw' => $attendance ? $attendance->punch_in : null,
                'punch_out_raw' => $attendance ? $attendance->punch_out : null,
                'punch_in_lat' => $attendance ? $attendance->punch_in_lat : null,
                'punch_in_lng' => $attendance ? $attendance->punch_in_lng : null,
                'punch_out_lat' => $attendance ? $attendance->punch_out_lat : null,
                'punch_out_lng' => $attendance ? $attendance->punch_out_lng : null,
                'device_type' => $attendance ? $attendance->device_type : null,
                'db_status' => $dbStatus,
                'current_status' => $currentStatus,
                'breaks' => $breaks,
            ];
        })->values();

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
    public function userIndex(Request $request)
    {
        $userId = auth()->id();
        $monthStr = $request->input('month', Carbon::now()->format('Y-m'));
        try {
            $month = Carbon::parse($monthStr);
        } catch (\Exception $e) {
            $month = Carbon::now();
        }

        // Get all attendance records for the month
        $attendances = Attendance::where('user_id', $userId)
            ->whereYear('date', $month->year)
            ->whereMonth('date', $month->month)
            ->get()
            ->keyBy(function ($item) {
                return $item->date instanceof \Carbon\Carbon ? $item->date->format('Y-m-d') : $item->date;
            });

        // Get approved leaves for the month
        $leaves = \App\Models\Leave::where('user_id', $userId)
            ->where('status', 'approved')
            ->where(function ($query) use ($month) {
                $query->whereBetween('from_date', [$month->copy()->startOfMonth()->toDateString(), $month->copy()->endOfMonth()->toDateString()])
                    ->orWhereBetween('to_date', [$month->copy()->startOfMonth()->toDateString(), $month->copy()->endOfMonth()->toDateString()]);
            })
            ->get();

        $totalMonthlyMinutes = $attendances->sum('total_worked_minutes');

        // Generate all dates for the month
        $startDate = $month->copy()->startOfMonth();
        $realEndDate = $month->copy()->endOfMonth();
        $today = Carbon::today();

        // Don't show future days beyond today
        $endDate = $realEndDate->gt($today) ? $today : $realEndDate;

        $attendanceData = [];

        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            $dateStr = $date->toDateString();
            $attendance = $attendances->get($dateStr);

            $status = '-';
            $checkIn = '-';
            $checkOut = '-';
            $hours = '-';
            $breakTime = '-';
            $attendanceId = null;

            if ($attendance) {
                $attendanceId = $attendance->id;
                $checkInTime = Carbon::parse($attendance->punch_in);
                $dateString = $attendance->date instanceof \Carbon\Carbon ? $attendance->date->format('Y-m-d') : $attendance->date;
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

                $checkIn = $attendance->punch_in ? Carbon::parse($attendance->punch_in)->format('h:i A') : '-';
                $checkOut = $attendance->punch_out ? Carbon::parse($attendance->punch_out)->format('h:i A') : '-';
                $hours = floor($attendance->total_worked_minutes / 60) . 'h ' . ($attendance->total_worked_minutes % 60) . 'm';
                $breakTime = floor(($attendance->total_break_minutes ?? 0) / 60) . 'h ' . (($attendance->total_break_minutes ?? 0) % 60) . 'm';
            } else {
                // Check if it's a Saturday or Sunday
                if ($date->isSaturday() || $date->isSunday()) {
                    $status = 'OFF';
                } else {
                    // Check for Leaves
                    $isOnLeave = $leaves->filter(function ($leave) use ($dateStr) {
                        return $dateStr >= $leave->from_date && $dateStr <= $leave->to_date;
                    })->first();

                    if ($isOnLeave) {
                        $status = 'Leave';
                    } elseif ($date->lt($today)) {
                        $status = 'Absent';
                    }
                }
            }

            $attendanceData[] = [
                'id' => $attendanceId ?? $dateStr,
                'date' => $dateStr,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'status' => $status,
                'hours' => $hours,
                'break_time' => $breakTime,
            ];
        }

        return Inertia::render('User/Attendance/Index', [
            'attendanceData' => $attendanceData,
            'totalMonthlyMinutes' => $totalMonthlyMinutes,
            'filters' => [
                'month' => $monthStr,
            ],
        ]);
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
