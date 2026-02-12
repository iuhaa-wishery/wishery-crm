<?php

namespace App\Http\Controllers;

use App\Models\ContentCalendar;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContentCalendarController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        $projectId = $request->input('project_id');
        $month = $request->input('month', date('m'));
        $year = $request->input('year', date('Y'));
        $userId = $request->input('user_id');
        $date = $request->input('date');

        $query = ContentCalendar::with(['project', 'assignees']);

        // If project is selected, show that project's items + unassigned items
        if ($projectId) {
            $query->where(function ($q) use ($projectId) {
                $q->where('project_id', $projectId)
                    ->orWhereNull('project_id');
            });
        }

        if ($month && $year && !$date) {
            $query->whereYear('date', $year)->whereMonth('date', $month);
        }

        if ($date) {
            $query->where('date', $date);
        }

        if ($userId) {
            $query->whereHas('assignees', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            });
        }

        // Get all items for the spreadsheet view
        $items = $query->orderBy('date', 'asc')->get();

        // Check if month is already generated (skeleton exists)
        $isMonthGenerated = ContentCalendar::whereYear('date', $year)
            ->whereMonth('date', $month)
            ->exists();

        return Inertia::render('Admin/ContentCalendar/Index', [
            'items_data' => $items,
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::whereNotIn('role', ['admin', 'manager', 'editor'])->select('id', 'name', 'image')->get(),
            'filters' => $request->only(['project_id', 'month', 'year', 'user_id', 'date']),
            'is_month_generated' => $isMonthGenerated
        ]);
    }

    public function addRow(Request $request)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
            'date' => 'nullable|date',
        ]);

        $projectId = $request->project_id;
        $month = $request->month;
        $year = $request->year;
        $requestedDate = $request->date;

        if ($requestedDate) {
            $nextDate = new \DateTime($requestedDate);
        } else {
            // Find the next available date in this month
            $lastEntry = ContentCalendar::where('project_id', $projectId)
                ->whereYear('date', $year)
                ->whereMonth('date', $month)
                ->orderBy('date', 'desc')
                ->first();

            if ($lastEntry) {
                $lastDate = new \DateTime($lastEntry->date);
                $nextDate = $lastDate->modify('+1 day');

                // Check if still in the same month
                if ((int) $nextDate->format('m') !== (int) $month) {
                    return redirect()->back()->with('error', 'Month is already full.');
                }
            } else {
                // Start from the 1st of the month
                $nextDate = new \DateTime(sprintf('%04d-%02d-01', $year, $month));
            }
        }

        $latest = ContentCalendar::latest('id')->first();
        $nextId = $latest ? $latest->id + 1 : 1;
        $uid = 'CC-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

        ContentCalendar::create([
            'project_id' => $projectId,
            'date' => $nextDate->format('Y-m-d'),
            'creative_uid' => $uid,
            'updation' => '',
            'is_additional' => true,
        ]);

        return redirect()->back()->with('success', 'Row added successfully.');
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'date' => 'required|date',
            'creative_type' => 'nullable|string',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:users,id',
            'updation' => 'nullable|string',
            'drive_link' => 'nullable|url',
            'thumbnail_link' => 'nullable|url',
            'creative_caption' => 'nullable|string',
        ]);

        // Auto-generate Creative UID
        $latest = ContentCalendar::latest('id')->first();
        $nextId = $latest ? $latest->id + 1 : 1;
        $validated['creative_uid'] = 'CC-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

        $contentCalendar = ContentCalendar::create($validated);

        if (isset($validated['assignees'])) {
            $contentCalendar->assignees()->sync($validated['assignees']);
        }

        return redirect()->back()->with('success', 'Content Calendar item created successfully.');
    }

    public function updateCell(Request $request, ContentCalendar $contentCalendar)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        $field = $request->input('field');
        $value = $request->input('value');

        $allowedFields = ['updation', 'drive_link', 'thumbnail_link', 'creative_caption', 'creative_type', 'project_id', 'date', 'assignees'];
        if (!in_array($field, $allowedFields)) {
            return response()->json(['error' => 'Invalid field'], 400);
        }

        if ($field === 'assignees') {
            $contentCalendar->assignees()->sync($value);
        } else {
            $contentCalendar->update([$field => $value]);
        }

        return response()->json(['success' => true]);
    }

    public function generateMonth(Request $request)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
        ]);

        $projectId = $request->project_id;
        $month = $request->month;
        $year = $request->year;

        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);

        $createdCount = 0;
        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = sprintf('%04d-%02d-%02d', $year, $month, $day);

            // Check if ANY entry exists for this specific day to avoid duplicate skeletons
            $exists = ContentCalendar::where('date', $date)
                ->exists();

            if (!$exists) {
                $latest = ContentCalendar::latest('id')->first();
                $nextId = $latest ? $latest->id + 1 : 1;
                $uid = 'CC-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

                ContentCalendar::create([
                    'project_id' => $projectId, // may be null
                    'date' => $date,
                    'creative_uid' => $uid,
                    'updation' => '',
                    'is_additional' => false,
                ]);
                $createdCount++;
            }
        }

        return redirect()->back()->with('success', "Generated $createdCount items for the month.");
    }

    public function update(Request $request, ContentCalendar $contentCalendar)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'date' => 'required|date',
            'creative_type' => 'nullable|string',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:users,id',
            'updation' => 'required|string',
            'drive_link' => 'nullable|url',
            'thumbnail_link' => 'nullable|url',
            'creative_caption' => 'nullable|string',
        ]);

        $contentCalendar->update($validated);

        if (isset($validated['assignees'])) {
            $contentCalendar->assignees()->sync($validated['assignees']);
        }

        return redirect()->back()->with('success', 'Content Calendar item updated successfully.');
    }

    public function clearRow(ContentCalendar $contentCalendar)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        $contentCalendar->update([
            'project_id' => null,
            'creative_type' => null,
            'updation' => '',
            'drive_link' => null,
            'thumbnail_link' => null,
            'creative_caption' => null,
        ]);

        $contentCalendar->assignees()->detach();

        return redirect()->back()->with('success', 'Row cleared successfully.');
    }

    public function destroy(ContentCalendar $contentCalendar)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        if (!$contentCalendar->is_additional) {
            return redirect()->back()->with('error', 'Primary rows (automatically generated) cannot be deleted. You can clear them instead.');
        }

        $contentCalendar->delete();

        return redirect()->back()->with('success', 'Additional row deleted successfully.');
    }
}
