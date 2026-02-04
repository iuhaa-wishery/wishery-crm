import React from "react";
import { Head, Link } from "@inertiajs/react";
import UserLayout from "@/Layouts/UserLayout";
import {
    Briefcase,
    CheckCircle2,
    Clock,
    Layers,
    Calendar,
    ChevronRight,
    ClipboardList
} from "lucide-react";
import AttendanceLargeCard from "@/Components/AttendanceLargeCard";

export default function Dashboard({ stats, todayAttendance, recentTasks }) {
    const statCards = [
        {
            label: "Assigned Tasks",
            value: stats.total_tasks,
            icon: Layers,
            color: "bg-blue-500",
            textColor: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            label: "In Progress",
            value: stats.in_progress_tasks,
            icon: Clock,
            color: "bg-purple-500",
            textColor: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            label: "Completed Tasks",
            value: stats.completed_tasks,
            icon: CheckCircle2,
            color: "bg-green-500",
            textColor: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            label: "Pending Leaves",
            value: stats.pending_leaves,
            icon: Calendar,
            color: "bg-orange-500",
            textColor: "text-orange-600",
            bgColor: "bg-orange-50"
        },
    ];

    const getPriorityColor = (priority) => {
        const p = priority?.toLowerCase();
        if (p === "high") return "bg-red-500";
        if (p === "medium") return "bg-yellow-500";
        if (p === "low") return "bg-green-500";
        return "bg-gray-400";
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        if (s === "completed") return "bg-green-500";
        if (s === "in progress") return "bg-blue-500";
        if (s === "on hold") return "bg-orange-500";
        return "bg-gray-400";
    };

    return (
        <div className="p-6 space-y-8">
            <Head title="User Dashboard" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Dashboard</h1>
                    <p className="text-gray-500 mt-1 text-lg">Welcome back! Here's an overview of your work.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Sidebar: Attendance & Quick Actions (Shows first on mobile) */}
                <div className="space-y-8 order-1 lg:order-2">
                    <AttendanceLargeCard />

                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <Link
                                href={route('tasks.index')}
                                className="flex items-center justify-between p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors group"
                            >
                                <span className="font-semibold">Update Task Status</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href={route('leave.create')}
                                className="flex items-center justify-between p-4 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors group"
                            >
                                <span className="font-semibold">Apply for Leave</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg">
                        <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                        <p className="text-blue-100 text-sm mb-6">If you have any issues with your tasks or attendance, contact your manager.</p>
                        <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>

                {/* Main Content: Stats & Tasks (Shows second on mobile) */}
                <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {statCards.map((card, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                                        <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value}</h3>
                                    </div>
                                    <div className={`${card.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                                        <card.icon className={`w-8 h-8 ${card.textColor}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Tasks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardList className="w-6 h-6 text-blue-600" />
                                My Recent Tasks
                            </h3>
                            <Link href={route('tasks.index')} className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentTasks.length > 0 ? (
                                recentTasks.map((task) => (
                                    <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${getPriorityColor(task.priority)} bg-opacity-10`}>
                                                <Layers className={`w-6 h-6 ${getPriorityColor(task.priority).replace('bg-', 'text-')}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{task.name}</h4>
                                                <p className="text-sm text-gray-500">Project: {task.project?.name || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(task.status)} text-white`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="p-10 text-center text-gray-500">No tasks assigned yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = (page) => <UserLayout title="Dashboard">{page}</UserLayout>;
