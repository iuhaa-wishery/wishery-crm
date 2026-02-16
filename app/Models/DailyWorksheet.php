<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyWorksheet extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'client_name',
        'task_type',
        'status',
        'file_name',
        'drive_link',
        'project',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
