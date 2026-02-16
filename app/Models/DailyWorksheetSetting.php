<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyWorksheetSetting extends Model
{
    protected $fillable = [
        'user_id',
        'client_name_enabled',
        'task_type_enabled',
        'status_enabled',
        'file_name_enabled',
        'drive_link_enabled',
        'project_enabled',
        'task_type_options',
    ];

    protected $casts = [
        'client_name_enabled' => 'boolean',
        'task_type_enabled' => 'boolean',
        'status_enabled' => 'boolean',
        'file_name_enabled' => 'boolean',
        'drive_link_enabled' => 'boolean',
        'project_enabled' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
