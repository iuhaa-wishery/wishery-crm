<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Leave;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (auth()->check() && auth()->user()->role !== 'admin') {
                abort(403, 'Unauthorized action.');
            }
            return $next($request);
        });
    }

    // Get all leave requests
    public function index(Request $request)
    {
        $year = $request->input('year', now()->year);
        $month = $request->input('month');
        $userId = $request->input('user_id');

        $query = Leave::with('user')->orderBy('from_date', 'desc');

        if ($year) {
            $query->whereYear('from_date', $year);
        }

        if ($month) {
            $query->whereMonth('from_date', $month);
        }

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $leaves = $query->paginate(10)->withQueryString();

        // Stats should be calculated for the selected year (or current year if not selected)
        $statsYear = $year ?: now()->year;

        $leaves->getCollection()->transform(function ($leave) use ($statsYear) {
            if ($leave->user) {
                $uid = $leave->user_id;
                $leave->user->leave_stats = [
                    'SL_taken' => Leave::where('user_id', $uid)
                        ->where('leave_type', 'SL')
                        ->where('status', 'approved')
                        ->whereYear('from_date', $statsYear)
                        ->sum('no_of_days'),
                    'CL_taken' => Leave::where('user_id', $uid)
                        ->where('leave_type', 'CL')
                        ->where('status', 'approved')
                        ->whereYear('from_date', $statsYear)
                        ->sum('no_of_days'),
                ];
            }
            return $leave;
        });

        $users = \App\Models\User::where('role', '!=', 'admin')->orderBy('name')->get(['id', 'name']);

        // Calculate aggregate or user-specific stats
        $stats = [
            'SL' => [
                'taken' => Leave::query()
                    ->when($year, fn($q) => $q->whereYear('from_date', $year))
                    ->when($month, fn($q) => $q->whereMonth('from_date', $month))
                    ->when($userId, fn($q) => $q->where('user_id', $userId))
                    ->where('leave_type', 'SL')
                    ->where('status', 'approved')
                    ->sum('no_of_days'),
                'total' => $userId ? 12 : null,
            ],
            'CL' => [
                'taken' => Leave::query()
                    ->when($year, fn($q) => $q->whereYear('from_date', $year))
                    ->when($month, fn($q) => $q->whereMonth('from_date', $month))
                    ->when($userId, fn($q) => $q->where('user_id', $userId))
                    ->where('leave_type', 'CL')
                    ->where('status', 'approved')
                    ->sum('no_of_days'),
                'total' => $userId ? 12 : null,
            ],
            'pending' => Leave::query()
                ->when($year, fn($q) => $q->whereYear('from_date', $year))
                ->when($month, fn($q) => $q->whereMonth('from_date', $month))
                ->when($userId, fn($q) => $q->where('user_id', $userId))
                ->where('status', 'pending')
                ->count(),
        ];

        return Inertia::render('Admin/Leaves/Index', [
            'leaves' => $leaves,
            'users' => $users,
            'stats' => $stats,
            'filters' => [
                'year' => $year,
                'month' => $month,
                'user_id' => $userId,
            ]
        ]);
    }

    // Approve leave
    public function approve($id)
    {
        $leave = Leave::findOrFail($id);
        $leave->status = 'approved';
        $leave->save();

        return back()->with('success', 'Leave approved successfully');
    }

    public function reject($id)
    {
        $leave = Leave::findOrFail($id);
        $leave->status = 'rejected';
        $leave->save();

        return back()->with('success', 'Leave rejected successfully');
    }
}
