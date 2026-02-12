<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ContentCalendar;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContentCalendarController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $month = $request->input('month', date('m'));
        $year = $request->input('year', date('Y'));
        $projectId = $request->input('project_id');
        $date = $request->input('date');

        $query = ContentCalendar::with(['project', 'assignees'])
            ->whereHas('assignees', function ($q) use ($user) {
                $q->where('users.id', $user->id);
            });

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($month && $year && !$date) {
            $query->whereYear('date', $year)->whereMonth('date', $month);
        }

        if ($date) {
            $query->where('date', $date);
        }

        $items = $query->orderBy('date', 'asc')->get();

        return Inertia::render('User/ContentCalendar/Index', [
            'items_data' => $items,
            'projects' => Project::select('id', 'name')->get(),
            'filters' => $request->only(['project_id', 'month', 'year', 'date'])
        ]);
    }

    public function updateCell(Request $request, ContentCalendar $contentCalendar)
    {
        $user = auth()->user();

        // Verify user is assigned to this item
        if (!$contentCalendar->assignees->contains($user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $field = $request->input('field');
        $value = $request->input('value');

        // Only allow editing specific fields
        $allowedFields = ['creative_type', 'updation', 'drive_link', 'thumbnail_link', 'creative_caption'];

        if (!in_array($field, $allowedFields)) {
            return response()->json(['error' => 'Field not editable'], 403);
        }

        $contentCalendar->update([$field => $value]);

        return response()->json(['success' => true]);
    }
}
