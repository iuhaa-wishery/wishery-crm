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
    ClipboardList,
    FileText
} from "lucide-react";
import AttendanceLargeCard from "@/Components/AttendanceLargeCard";

export default function Dashboard({ stats, todayAttendance, filteredStats }) {
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

    return (
        <div className="p-6 space-y-8">
            <Head title="User Dashboard" />

            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-500 mt-1 text-lg">Welcome back! Here's an overview of your work.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Analytics Section */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-6 group hover:border-indigo-200 transition-all">
                            <div className="bg-indigo-50 p-6 rounded-3xl group-hover:scale-110 transition-transform">
                                <Calendar className="w-12 h-12 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">Posted Content</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 leading-tight">
                                    {filteredStats.content_calendar_count}
                                    <span className="text-lg font-medium text-gray-400 ml-2 italic">this month</span>
                                </h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-6 group hover:border-emerald-200 transition-all">
                            <div className="bg-emerald-50 p-6 rounded-3xl group-hover:scale-110 transition-transform">
                                <FileText className="w-12 h-12 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">Work Logs</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 leading-tight">
                                    {filteredStats.daily_worksheet_count}
                                    <span className="text-lg font-medium text-gray-400 ml-2 italic">this month</span>
                                </h3>
                            </div>
                        </div>
                    </section>

                    {/* Secondary Stats */}
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Task & Leave Overview</h2>
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
                    </section>
                </div>

                <div className="space-y-8">
                    <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
                        <AttendanceLargeCard todayAttendance={todayAttendance} />
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">My Worklinks</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Quickly jump to your task list or apply for leave.</p>
                            <div className="space-y-3">
                                <Link
                                    href={route('tasks.index')}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 text-sm font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-sm"
                                >
                                    <Layers className="w-4 h-4" /> Go to Tasks
                                </Link>
                                <Link
                                    href={route('leave.create')}
                                    className="w-full flex items-center justify-center gap-2 py-3 border border-indigo-400/50 text-white text-sm font-bold rounded-2xl hover:bg-white/10 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" /> Apply for Leave
                                </Link>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = (page) => <UserLayout title="Dashboard">{page}</UserLayout>;
