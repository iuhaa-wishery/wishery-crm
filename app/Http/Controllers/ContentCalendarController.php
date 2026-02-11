<?php

namespace App\Http\Controllers;

use App\Models\ContentCalendar;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContentCalendarController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        $items = ContentCalendar::with(['project', 'assignees'])
            ->orderBy('date', 'asc')
            ->paginate(10);

        return Inertia::render('Admin/ContentCalendar/Index', [
            'items' => $items,
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::whereNotIn('role', ['admin', 'manager', 'editor'])->select('id', 'name', 'image')->get(),
        ]);
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
            'status' => 'required|string',
            'drive_link' => 'nullable|url',
            'thumbnail_link' => 'nullable|url',
            'caption' => 'nullable|string',
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
            'status' => 'required|string',
            'drive_link' => 'nullable|url',
            'thumbnail_link' => 'nullable|url',
            'caption' => 'nullable|string',
        ]);

        $contentCalendar->update($validated);

        if (isset($validated['assignees'])) {
            $contentCalendar->assignees()->sync($validated['assignees']);
        }

        return redirect()->back()->with('success', 'Content Calendar item updated successfully.');
    }

    public function destroy(ContentCalendar $contentCalendar)
    {
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'manager', 'editor'])) {
            abort(403, 'Unauthorized action.');
        }

        $contentCalendar->delete();

        return redirect()->back()->with('success', 'Content Calendar item deleted successfully.');
    }
}
