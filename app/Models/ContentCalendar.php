<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentCalendar extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        // 'assignee_id' removed
        'creative_uid',
        'date',
        'creative_type',
        'status',
        'drive_link',
        'thumbnail_link',
        'caption',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function assignees()
    {
        return $this->belongsToMany(User::class, 'content_calendar_user');
    }
}
