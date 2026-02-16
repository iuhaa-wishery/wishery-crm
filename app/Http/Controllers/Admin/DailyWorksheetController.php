<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\DailyWorksheet;
use App\Models\DailyWorksheetSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DailyWorksheetController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $date = $request->input('date', Carbon::today()->toDateString());

        $query = DailyWorksheet::with(['user', 'user.dailyWorksheetSetting'])
            ->whereDate('date', $date);

        $users = [];
        $selectedUser = null;

        if ($user->role === 'admin') {
            $selectedUser = $request->input('user_id');
            if ($selectedUser) {
                $query->where('user_id', $selectedUser);
            }

            $users = User::where('role', '!=', 'admin')
                ->orderBy('name')
                ->select('id', 'name')
                ->get();
        } else {
            // Editors/Managers/Users only see their own
            $query->where('user_id', $user->id);
        }

        $worksheets = $query->latest()->get();

        return Inertia::render('Admin/DailyWorksheet/Index', [
            'worksheets' => $worksheets,
            'selectedDate' => $date,
            'selectedUser' => $selectedUser,
            'users' => $users,
        ]);
    }

    public function users(Request $request)
    {
        $users = User::where('role', '!=', 'admin')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/WorksheetSettings/UserList', [
            'users' => $users,
        ]);
    }

    public function settings(User $user)
    {
        $settings = DailyWorksheetSetting::where('user_id', $user->id)->first();

        if (!$settings) {
            $settings = DailyWorksheetSetting::create([
                'user_id' => $user->id,
                'client_name_enabled' => true,
                'task_type_enabled' => true,
                'status_enabled' => true,
            ]);
        }

        return Inertia::render('Admin/WorksheetSettings/Index', [
            'user' => $user,
            'settings' => $settings,
        ]);
    }

    public function updateSettings(Request $request, User $user)
    {
        $validated = $request->validate([
            'client_name_enabled' => 'boolean',
            'task_type_enabled' => 'boolean',
            'status_enabled' => 'boolean',
            'file_name_enabled' => 'boolean',
            'drive_link_enabled' => 'boolean',
            'project_enabled' => 'boolean',
            'task_type_options' => 'nullable|string',
        ]);

        DailyWorksheetSetting::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return back()->with('success', 'Worksheet settings updated successfully.');
    }
}
