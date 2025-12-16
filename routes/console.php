<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Models\Attendance;
use Carbon\Carbon;

Schedule::call(function () {
    Attendance::where('status', '!=', 'punched_out')
        ->whereDate('date', Carbon::yesterday())
        ->update([
            'status' => 'punched_out',
            'punch_out' => Carbon::yesterday()->endOfDay(),
        ]);
})->daily();
