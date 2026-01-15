import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = ({ attendanceData, leaves, filters, onFilterChange }) => {
    const monthDate = useMemo(() => {
        return filters.month ? new Date(filters.month + '-01') : new Date();
    }, [filters.month]);

    const daysInMonth = useMemo(() => {
        return new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    }, [monthDate]);

    const firstDayOfMonth = useMemo(() => {
        return new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
    }, [monthDate]);

    const calendarDays = useMemo(() => {
        const days = [];
        const prevMonthLastDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0).getDate();

        // Padding days from previous month
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                currentMonth: false,
                date: null
            });
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            // Find attendance record
            const attendance = attendanceData.find(a => {
                const aDate = new Date(a.date);
                return aDate.getFullYear() === monthDate.getFullYear() &&
                    aDate.getMonth() === monthDate.getMonth() &&
                    aDate.getDate() === i;
            });

            // Find leave record
            const leave = leaves?.find(l => {
                const start = new Date(l.from_date);
                const end = new Date(l.to_date);
                const current = new Date(dateStr);
                return current >= start && current <= end;
            });

            let status = 'Absent';
            if (attendance) {
                status = attendance.status;
            } else if (leave) {
                if (leave.day_type === 'first_half' || leave.day_type === 'second_half') {
                    status = 'Half Day';
                } else {
                    status = 'On Leave';
                }
            }

            days.push({
                day: i,
                currentMonth: true,
                date: dateStr,
                attendance,
                leave,
                status
            });
        }

        // Padding days for next month to complete the grid (6 rows * 7 days = 42)
        const totalCells = 42;
        const remainingCells = totalCells - days.length;
        for (let i = 1; i <= remainingCells; i++) {
            days.push({
                day: i,
                currentMonth: false,
                date: null
            });
        }

        return days;
    }, [monthDate, daysInMonth, firstDayOfMonth, attendanceData, leaves]);

    const handlePrevMonth = () => {
        const prev = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
        onFilterChange('month', `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
    };

    const handleNextMonth = () => {
        const next = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
        onFilterChange('month', `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-600';
            case 'Late':
            case 'Early Leave':
            case 'Late & Early Leave': return 'bg-orange-100 text-orange-600';
            case 'Half Day': return 'bg-blue-100 text-blue-600';
            case 'Absent': return 'bg-red-100 text-red-600';
            case 'On Leave': return 'bg-purple-100 text-purple-600';
            default: return 'bg-gray-50 text-gray-400';
        }
    };

    const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    const today = new Date().toISOString().slice(0, 10);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-bold text-gray-800">Calendar</h3>
                <div className="flex items-center gap-4">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 min-w-[120px] text-center">
                        {monthName}
                    </div>
                    <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-4">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-gray-400 tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
                {calendarDays.map((item, idx) => (
                    <div
                        key={idx}
                        className={`min-h-[110px] rounded-2xl border p-3 flex flex-col transition-all ${!item.currentMonth ? 'bg-gray-50/30 border-transparent' : 'bg-white border-gray-100'
                            } ${item.date === today ? 'border-blue-400 ring-1 ring-blue-400' : ''}`}
                    >
                        <span className={`text-sm font-bold ${!item.currentMonth ? 'text-gray-300' : 'text-gray-400'}`}>
                            {item.day}
                        </span>

                        {item.currentMonth && (
                            <div className={`mt-auto px-3 py-1.5 rounded-xl text-[11px] font-bold text-center ${getStatusStyles(item.status)}`}>
                                {item.status === 'Late & Early Leave' ? 'Late' : item.status}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-10 flex justify-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-700 font-medium">Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-700 font-medium">Late</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-700 font-medium">Half Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-700 font-medium">Absent</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
