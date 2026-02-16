<?php

namespace App\Policies;

use App\Models\DailyWorksheet;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DailyWorksheetPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, DailyWorksheet $dailyWorksheet): bool
    {
        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, DailyWorksheet $dailyWorksheet): bool
    {
        return $user->id === $dailyWorksheet->user_id || $user->role === 'admin';
    }

    public function delete(User $user, DailyWorksheet $dailyWorksheet): bool
    {
        return $user->id === $dailyWorksheet->user_id || $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, DailyWorksheet $dailyWorksheet): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, DailyWorksheet $dailyWorksheet): bool
    {
        return false;
    }
}
