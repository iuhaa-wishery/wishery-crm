<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');

        // Automatically calculate working days for current month if not set
        if (!isset($settings['monthly_working_days'])) {
            $settings['monthly_working_days'] = $this->calculateWorkingDays(Carbon::now());
        }

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'admin_email' => 'nullable|email',
            'monthly_working_days' => 'nullable|integer|min:0|max:31',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return back()->with('success', 'Settings updated successfully.');
    }

    private function calculateWorkingDays(Carbon $date)
    {
        $daysInMonth = $date->daysInMonth;
        $workingDays = 0;

        for ($i = 1; $i <= $daysInMonth; $i++) {
            $currentDate = Carbon::create($date->year, $date->month, $i);
            if (!$currentDate->isWeekend()) {
                $workingDays++;
            }
        }

        return $workingDays;
    }
}