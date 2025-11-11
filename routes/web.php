<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Admin\TaskController as AdminTaskController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\User\ProjectController as UserProjectController;

// Default home redirects to login
Route::get('/', function () {
    return redirect()->route('login');
});

// Dashboard (redirects based on role)
Route::middleware(['auth'])->get('/dashboard', function () {
    $user = auth()->user();

    if ($user->role === 'admin') {
        return Inertia::render('Admin/Dashboard');
    }

    return Inertia::render('Dashboard');
})->name('dashboard');

// User routes (normal users)
Route::middleware(['auth'])->group(function () {
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    
    // REVERTED TO STANDARD: This must be PUT as per the RESTful intention. 
    // Inertia's router.put() handles the underlying POST/spoofing correctly.
    Route::put('/tasks/{task}/status', [TaskController::class, 'updateStatus'])
    ->name('tasks.updateStatus');

    Route::get('/projects', [UserProjectController::class, 'index'])->name('projects.index');

    // ✅ User Profile
    Route::get('/profile', function () {
        return Inertia\Inertia::render('Profile/Index');
    })->name('profile');
});

// Admin routes
Route::middleware(['auth', 'is_admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('users', AdminUserController::class);
        Route::patch('users/{user}/toggle', [AdminUserController::class, 'toggle'])
            ->name('users.toggle');

        Route::resource('projects', AdminProjectController::class);
        Route::post('projects/{project}/tasks/reorder', [AdminProjectController::class, 'reorder'])
            ->name('projects.tasks.reorder');

        Route::resource('tasks', AdminTaskController::class);

        Route::put('/tasks/{id}/status', [AdminTaskController::class, 'updateStatus'])
            ->name('tasks.status');
    });


require __DIR__.'/auth.php';
