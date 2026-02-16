<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected $appends = ['image_url'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'image',
        'thumb',
        'desktop_only',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'desktop_only' => 'boolean',
        ];
    }

    /**
     * Get the user's image path, preferring 'image' over 'thumb'.
     */
    public function getImagePathAttribute(): ?string
    {
        return $this->image ?: $this->thumb;
    }

    /**
     * Get the user's full image URL.
     */
    public function getImageUrlAttribute(): ?string
    {
        $path = $this->thumb ?: $this->image;
        if (!$path) {
            return null;
        }

        // If it's already a full URL (e.g. from Google Drive), return it
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        // If it starts with 'uploads/', it's a public upload
        if (str_starts_with($path, 'uploads/')) {
            return asset($path);
        }

        // Fallback for old storage paths (though we are moving away from them)
        return asset('storage/' . $this->image);
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_user')->withTimestamps();
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function leaves()
    {
        return $this->hasMany(Leave::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function dailyWorksheetSetting()
    {
        return $this->hasOne(DailyWorksheetSetting::class);
    }
}
