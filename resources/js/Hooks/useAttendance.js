import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function useAttendance() {
    const [status, setStatus] = useState('loading'); // loading, not_started, punched_in, on_break, punched_out
    const [attendance, setAttendance] = useState(null);
    const [timer, setTimer] = useState(0); // in seconds
    const [breakTimer, setBreakTimer] = useState(0); // in seconds
    const [processing, setProcessing] = useState(false);

    const parseSafariDate = (dateString) => {
        if (!dateString) return new Date();
        const isoString = dateString.toString().replace(/\s/, 'T');
        return new Date(isoString);
    };

    const calculateTimers = useCallback((attendanceData, nowString) => {
        if (!attendanceData) {
            setTimer(0);
            return;
        }

        const now = parseSafariDate(nowString).getTime();
        const punchIn = parseSafariDate(attendanceData.punch_in).getTime();
        const totalWorkedMs = (attendanceData.total_worked_minutes || 0) * 60 * 1000;

        if (attendanceData.status === 'punched_in') {
            const currentSession = now - punchIn;
            setTimer(Math.floor((totalWorkedMs + currentSession) / 1000));
        } else if (attendanceData.status === 'on_break') {
            const breakStart = new Date(attendanceData.break_start.replace(/\s/, 'T')).getTime();
            const currentSessionBeforeBreak = breakStart - punchIn;
            setTimer(Math.floor((totalWorkedMs + currentSessionBeforeBreak) / 1000));
            const currentBreakDuration = now - breakStart;
            setBreakTimer(Math.floor(currentBreakDuration / 1000));
        } else if (attendanceData.status === 'punched_out') {
            setTimer(Math.floor(totalWorkedMs / 1000));
            const totalBreakMs = (attendanceData.total_break_minutes || 0) * 60 * 1000;
            setBreakTimer(Math.floor(totalBreakMs / 1000));
        }
    }, []);

    const fetchStatus = useCallback(async () => {
        try {
            const response = await axios.get(route('attendance.status'));
            const { status: currentStatus, attendance: currentAttendance, now } = response.data;
            setStatus(currentStatus);
            setAttendance(currentAttendance);
            calculateTimers(currentAttendance, now);
        } catch (error) {
            console.error("Failed to fetch attendance status", error);
            setStatus('not_started');
        }
    }, [calculateTimers]);

    useEffect(() => {
        fetchStatus();
        const timeout = setTimeout(() => {
            setStatus(s => s === 'loading' ? 'not_started' : s);
        }, 5000);
        return () => clearTimeout(timeout);
    }, [fetchStatus]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (status === 'punched_in') {
                setTimer(prev => prev + 1);
            } else if (status === 'on_break') {
                setBreakTimer(prev => prev + 1);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [status]);

    const handleAction = (action) => {
        let url = '';
        switch (action) {
            case 'punch-in': url = route('attendance.punchIn'); break;
            case 'punch-out': url = route('attendance.punchOut'); break;
            case 'break-start': url = route('attendance.break.start'); break;
            case 'break-end': url = route('attendance.break.end'); break;
        }

        setProcessing(true);

        const executeRequest = (data = {}) => {
            router.post(url, data, {
                preserveScroll: true,
                onSuccess: () => fetchStatus(),
                onFinish: () => setProcessing(false),
            });
        };

        if (action === 'punch-in' || action === 'punch-out') {
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                alert("Location access requires a secure HTTPS connection.");
                setProcessing(false);
                return;
            }

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => executeRequest({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                    (err) => {
                        console.error("Geo error", err);
                        alert("Location error. Please ensure location services are enabled.");
                        setProcessing(false);
                    },
                    { enableHighAccuracy: true, timeout: 15000 }
                );
            } else {
                alert("Geolocation not supported.");
                setProcessing(false);
            }
        } else {
            executeRequest();
        }
    };

    return {
        status,
        attendance,
        timer,
        breakTimer,
        processing,
        handleAction,
        fetchStatus
    };
}
