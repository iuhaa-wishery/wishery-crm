<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\User\ProjectController as UserProjectController;

// NEW
use App\Http\Controllers\User\LeaveController as UserLeaveController;
use App\Http\Controllers\Admin\LeaveController as AdminLeaveController;
use App\Http\Controllers\GoogleDriveController;


// Home page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// Dashboard (redirects based on role)
Route::middleware(['auth'])->get('/dashboard', function () {
    $user = auth()->user();

    if (in_array($user->role, ['admin', 'manager'])) {
        return Inertia::render('Admin/Dashboard');
    }

    return Inertia::render('Dashboard');
})->name('dashboard');


// -----------------------------
// USER ROUTES
// -----------------------------
Route::middleware(['auth'])->group(function () {

    // Tasks
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::put('/tasks/{task}/status', [TaskController::class, 'updateStatus'])
        ->name('tasks.updateStatus');

    // Projects
    Route::get('/projects', [UserProjectController::class, 'index'])->name('projects.index');

    // Profile
    Route::get('/profile', function () {
        return Inertia\Inertia::render('Profile/Index');
    })->name('profile');

    // -------------------------
    // ✅ USER LEAVE ROUTES
    // -------------------------
    Route::get('/leave', [UserLeaveController::class, 'index'])->name('leave.index');
    Route::get('/leave/apply', [UserLeaveController::class, 'create'])->name('leave.create');
    Route::post('/leave/store', [UserLeaveController::class, 'store'])->name('leave.store');

    // -------------------------
    // ✅ CALENDAR ROUTE
    // -------------------------
    Route::get('/calendar', [App\Http\Controllers\CalendarController::class, 'index'])->name('calendar.index');

    // -------------------------
    // ✅ GOOGLE DRIVE ROUTES
    // -------------------------
    Route::get('/google-drive/files', [GoogleDriveController::class, 'index'])->name('google-drive.files');
    Route::post('/google-drive/upload', [GoogleDriveController::class, 'upload'])->name('google-drive.upload');
    Route::post('/google-drive/create-folder', [GoogleDriveController::class, 'createFolder'])->name('google-drive.create-folder');
    Route::delete('/google-drive/delete', [GoogleDriveController::class, 'delete'])->name('google-drive.delete');
    Route::get('/drive', function () {
        return Inertia::render('Drive/Index');
    })->name('drive.index');
    // -------------------------
    // ✅ ATTENDANCE ROUTES
    // -------------------------
    Route::get('/attendance/status', [App\Http\Controllers\AttendanceController::class, 'status'])->name('attendance.status');
    Route::post('/attendance/punch-in', [App\Http\Controllers\AttendanceController::class, 'punchIn'])->name('attendance.punchIn');
    Route::post('/attendance/punch-out', [App\Http\Controllers\AttendanceController::class, 'punchOut'])->name('attendance.punchOut');
    Route::post('/attendance/break/start', [App\Http\Controllers\AttendanceController::class, 'startBreak'])->name('attendance.break.start');
    Route::post('/attendance/break/end', [App\Http\Controllers\AttendanceController::class, 'endBreak'])->name('attendance.break.end');
});


// -----------------------------
// ADMIN ROUTES
// -----------------------------
Route::middleware(['auth', 'is_admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/drive', function () {
            return Inertia::render('Admin/Drive/Index');
        })->name('drive.index');

        Route::patch('users/toggle/{user}', [AdminUserController::class, 'toggle'])
            ->name('users.toggle');
        Route::resource('users', AdminUserController::class);

        Route::resource('projects', AdminProjectController::class);
        Route::post('projects/{project}/tasks/reorder', [AdminProjectController::class, 'reorder'])
            ->name('projects.tasks.reorder');

        Route::resource('tasks', AdminTaskController::class);
        Route::put('/tasks/{id}/status', [AdminTaskController::class, 'updateStatus'])
            ->name('tasks.status');

        // -------------------------
        // ✅ ADMIN LEAVE ROUTES
        // -------------------------
        Route::get('leaves', [AdminLeaveController::class, 'index'])->name('leaves.index');
        Route::get('leaves/{id}', [AdminLeaveController::class, 'show'])->name('leaves.show');
        Route::post('leaves/{id}/approve', [AdminLeaveController::class, 'approve'])->name('leaves.approve');
        Route::post('leaves/{id}/reject', [AdminLeaveController::class, 'reject'])->name('leaves.reject');

        // -------------------------
        // ✅ ATTENDANCE ROUTES
        // -------------------------
        Route::get('attendance', [App\Http\Controllers\AttendanceController::class, 'index'])->name('attendance.index');
    });


require __DIR__ . '/auth.php';
require __DIR__ . '/debug.php';
