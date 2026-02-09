<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Leave;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function getNotifications()
    {
        $user = Auth::user();
        if (!$user)
            return response()->json(['notifications' => []], 401);

        $notifications = [];

        // 1. Unread Chat Messages
        $unreadMessages = Message::with('sender')
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($unreadMessages as $msg) {
            $notifications[] = [
                'id' => 'msg_' . $msg->id,
                'type' => 'chat',
                'title' => 'New message from ' . $msg->sender->name,
                'message' => $msg->message,
                'time' => $msg->created_at->diffForHumans(),
                'link' => route('chat.index'),
                'icon' => 'chat'
            ];
        }

        // 2. Leave Requests
        if (in_array($user->role, ['admin', 'manager'])) {
            // Admins see pending leaves from others
            $pendingLeaves = Leave::with('user')
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($pendingLeaves as $leave) {
                $notifications[] = [
                    'id' => 'leave_' . $leave->id,
                    'type' => 'leave',
                    'title' => 'Leave Request: ' . $leave->user->name,
                    'message' => $leave->leave_type . ' from ' . $leave->from_date . ' to ' . $leave->to_date,
                    'time' => $leave->created_at->diffForHumans(),
                    'link' => route('admin.leaves.index'),
                    'icon' => 'leave'
                ];
            }
        } else {
            // Users see approvals/rejections of their own leaves
            $updatedLeaves = Leave::where('user_id', $user->id)
                ->whereIn('status', ['approved', 'rejected'])
                ->where('updated_at', '>', now()->subDays(3)) // Show recent updates
                ->orderBy('updated_at', 'desc')
                ->get();

            foreach ($updatedLeaves as $leave) {
                $notifications[] = [
                    'id' => 'leave_' . $leave->id,
                    'type' => 'leave_update',
                    'title' => 'Leave ' . ucfirst($leave->status),
                    'message' => 'Your ' . $leave->leave_type . ' request was ' . $leave->status,
                    'time' => $leave->updated_at->diffForHumans(),
                    'link' => route('leave.index'),
                    'icon' => 'leave'
                ];
            }
        }

        // Sort by time (implied or explicit)
        // Since we combined them, let's sort if needed, but for now chronological per type is okay.

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => count($notifications)
        ]);
    }
}
