import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Play, Square, Coffee, Clock } from 'lucide-react';

export default function AttendanceWidget() {
    // Version: 1.1 (Multiple Punch-in Support)
    const [status, setStatus] = useState('loading'); // loading, not_started, punched_in, on_break, punched_out
    const [attendance, setAttendance] = useState(null);
    const [timer, setTimer] = useState(0); // in seconds
    const [breakTimer, setBreakTimer] = useState(0); // in seconds

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(() => {
            tick();
        }, 1000);
        return () => clearInterval(interval);
    }, [status]); // Re-run effect when status changes to update tick logic

    const fetchStatus = async () => {
        try {
            const response = await axios.get(route('attendance.status'));
            const { status, attendance, now } = response.data;
            setStatus(status);
            setAttendance(attendance);
            calculateTimers(attendance, now);
        } catch (error) {
            console.error("Failed to fetch attendance status", error);
        }
    };

    const calculateTimers = (attendance, nowString) => {
        if (!attendance) {
            setTimer(0);
            return;
        }

        const now = new Date(nowString).getTime();
        const punchIn = new Date(attendance.punch_in).getTime();
        const totalWorkedMs = (attendance.total_worked_minutes || 0) * 60 * 1000;

        if (attendance.status === 'punched_in') {
            // Current Session + Previous Sessions
            // Note: total_worked_minutes only stores COMPLETED sessions.
            // So we add (Now - PunchIn) to total_worked_minutes.
            const currentSession = now - punchIn;
            setTimer(Math.floor((totalWorkedMs + currentSession) / 1000));
        } else if (attendance.status === 'on_break') {
            // Worked time is fixed until break ends
            // But we need to account for the session BEFORE the break started.
            // If we are on break, punch_in is still the start of the CURRENT session.
            // So worked = (BreakStart - PunchIn) + PreviousSessions
            const breakStart = new Date(attendance.break_start).getTime();
            const currentSessionBeforeBreak = breakStart - punchIn;

            setTimer(Math.floor((totalWorkedMs + currentSessionBeforeBreak) / 1000));

            const currentBreakDuration = now - breakStart;
            setBreakTimer(Math.floor(currentBreakDuration / 1000));
        } else if (attendance.status === 'punched_out') {
            // Just show total worked minutes
            setTimer(Math.floor(totalWorkedMs / 1000));
        }
    };

    const tick = () => {
        if (status === 'punched_in') {
            setTimer(prev => prev + 1);
        } else if (status === 'on_break') {
            setBreakTimer(prev => prev + 1);
        }
    };

    const formatTime = (seconds) => {
        if (seconds < 0) seconds = 0;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAction = (action) => {
        let url = '';
        let method = 'post';

        switch (action) {
            case 'punch-in': url = route('attendance.punchIn'); break;
            case 'punch-out': url = route('attendance.punchOut'); break;
            case 'break-start': url = route('attendance.break.start'); break;
            case 'break-end': url = route('attendance.break.end'); break;
        }

        router.post(url, {}, {
            preserveScroll: true,
            onSuccess: () => fetchStatus(),
        });
    };

    if (status === 'loading') return <div className="text-sm text-gray-500">Loading...</div>;

    return (
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            {/* Timer Display */}
            <div className="flex flex-col items-end min-w-[80px]">
                <div className="flex items-center text-gray-800 font-mono font-bold text-lg">
                    <Clock className="w-4 h-4 mr-1 text-blue-600" />
                    {formatTime(timer)}
                </div>
                {status === 'on_break' && (
                    <div className="text-xs text-orange-600 font-medium">
                        Break: {formatTime(breakTimer)}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
                {(status === 'not_started' || status === 'punched_out') && (
                    <button
                        onClick={() => handleAction('punch-in')}
                        className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition"
                    >
                        <Play className="w-3 h-3 mr-1" /> Punch In
                    </button>
                )}

                {status === 'punched_in' && (
                    <>
                        <button
                            onClick={() => handleAction('break-start')}
                            className="flex items-center px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600 transition"
                        >
                            <Coffee className="w-3 h-3 mr-1" /> Break
                        </button>
                        <button
                            onClick={() => handleAction('punch-out')}
                            className="flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition"
                        >
                            <Square className="w-3 h-3 mr-1" /> Punch Out
                        </button>
                    </>
                )}

                {status === 'on_break' && (
                    <button
                        onClick={() => handleAction('break-end')}
                        className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                    >
                        <Play className="w-3 h-3 mr-1" /> Resume
                    </button>
                )}

            </div>
        </div>
    );
}
