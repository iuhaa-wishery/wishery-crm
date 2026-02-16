<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
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
        $month = $request->input('month'); // YYYY-MM format

        $settings = DailyWorksheetSetting::where('user_id', $user->id)->first();

        // Default settings if not found
        if (!$settings) {
            $settings = (object) [
                'client_name_enabled' => true,
                'task_type_enabled' => true,
                'status_enabled' => true,
                'file_name_enabled' => false,
                'drive_link_enabled' => false,
                'project_enabled' => false,
                'task_type_options' => 'DONE,NOT DONE,IN PROGRESS',
            ];
        }

        $query = DailyWorksheet::where('user_id', $user->id);

        if ($month) {
            $yearMonth = Carbon::parse($month);
            $query->whereYear('date', $yearMonth->year)
                ->whereMonth('date', $yearMonth->month);
        } else {
            $query->whereDate('date', $date);
        }

        $worksheets = $query->latest()->get();

        return Inertia::render('User/DailyWorksheet/Index', [
            'worksheets' => $worksheets,
            'settings' => $settings,
            'selectedDate' => $date,
            'selectedMonth' => $month, // Pass month back to view
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        $settings = DailyWorksheetSetting::where('user_id', $user->id)->first();

        $rules = [
            'date' => 'required|date',
        ];

        if ($settings) {
            if ($settings->client_name_enabled)
                $rules['client_name'] = 'required|string';
            if ($settings->task_type_enabled)
                $rules['task_type'] = 'required|string';
            if ($settings->status_enabled)
                $rules['status'] = 'required|string';
            if ($settings->file_name_enabled)
                $rules['file_name'] = 'required|string';
            if ($settings->drive_link_enabled)
                $rules['drive_link'] = 'required|url';
            if ($settings->project_enabled)
                $rules['project'] = 'required|string';
        }

        $validated = $request->validate($rules);
        $validated['user_id'] = $user->id;

        // Fill non-required but fillable fields if present and not empty
        $fillable = ['client_name', 'task_type', 'status', 'file_name', 'drive_link', 'project'];
        foreach ($fillable as $field) {
            if (!isset($validated[$field]) && $request->has($field)) {
                $validated[$field] = $request->input($field);
            }
        }

        DailyWorksheet::create($validated);

        return back()->with('success', 'Daily task added successfully.');
    }

    public function update(Request $request, DailyWorksheet $dailyWorksheet)
    {
        $this->authorize('update', $dailyWorksheet);

        $user = auth()->user();
        $settings = DailyWorksheetSetting::where('user_id', $user->id)->first();

        $rules = [];
        if ($settings) {
            if ($settings->client_name_enabled)
                $rules['client_name'] = 'required|string';
            if ($settings->task_type_enabled)
                $rules['task_type'] = 'required|string';
            if ($settings->status_enabled)
                $rules['status'] = 'required|string';
            if ($settings->file_name_enabled)
                $rules['file_name'] = 'required|string';
            if ($settings->drive_link_enabled)
                $rules['drive_link'] = 'required|url';
            if ($settings->project_enabled)
                $rules['project'] = 'required|string';
        }

        $validated = $request->validate($rules);

        // Fill non-required but fillable fields
        $fillable = ['client_name', 'task_type', 'status', 'file_name', 'drive_link', 'project'];
        foreach ($fillable as $field) {
            if (!isset($validated[$field]) && $request->has($field)) {
                $validated[$field] = $request->input($field);
            }
        }

        $dailyWorksheet->update($validated);

        return back()->with('success', 'Daily task updated successfully.');
    }

    public function destroy(DailyWorksheet $dailyWorksheet)
    {
        $this->authorize('delete', $dailyWorksheet);
        $dailyWorksheet->delete();

        return back()->with('success', 'Daily task deleted successfully.');
    }
}
