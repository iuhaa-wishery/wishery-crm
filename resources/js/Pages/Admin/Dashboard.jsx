import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link, usePage, router } from "@inertiajs/react";
import {
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Calendar,
  FileText,
  Filter
} from "lucide-react";
import AttendanceLargeCard from "@/Components/AttendanceLargeCard";

export default function Dashboard({
  stats,
  users = [],
  filteredStats,
  filters,
  todayAttendance,
  personalStats,
  recentTasks
}) {
  const { auth } = usePage().props;
  const isManager = auth.user?.role === 'manager' || auth.user?.role === 'editor';

  const [filterValues, setFilterValues] = useState({
    month: filters.month,
    year: filters.year,
    user_id: filters.user_id || ""
  });

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filterValues, [name]: value };
    setFilterValues(newFilters);
    router.get(route('dashboard'), newFilters, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const adminStatCards = [
    {
      label: "Total Employees",
      value: stats.total_users,
      icon: Users,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      adminOnly: true
    },
    {
      label: "Pending Leaves",
      value: stats.pending_leaves,
      icon: Clock,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      adminOnly: true
    },
  ];

  const personalStatCards = [
    {
      label: "Assigned Tasks",
      value: personalStats.total_tasks,
      icon: Layers,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "In Progress",
      value: personalStats.in_progress_tasks,
      icon: Clock,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Completed Tasks",
      value: personalStats.completed_tasks,
      icon: CheckCircle2,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      label: "Pending Leaves",
      value: personalStats.pending_leaves || 0,
      icon: Calendar,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50"
    }
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
      <Head title="Dashboard" />

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 text-lg">Welcome back! Here's an overview of your work and team.</p>
        </div>

        {/* Filters - Admin Only */}
        {auth.user.role === 'admin' && (
          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 px-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Team Filters</span>
            </div>

            <select
              value={filterValues.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              className="border-0 focus:ring-0 text-sm font-semibold text-gray-700 cursor-pointer p-0 pr-8 min-w-[150px]"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
            <div className="h-6 w-px bg-gray-200"></div>
            <select
              value={filterValues.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="border-0 focus:ring-0 text-sm font-semibold text-gray-700 cursor-pointer p-0 pr-8"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <div className="h-6 w-px bg-gray-200"></div>
            <select
              value={filterValues.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="border-0 focus:ring-0 text-sm font-semibold text-gray-700 cursor-pointer p-0 pr-8"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">

          {/* Personal Stats Section */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">My Personal Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalStatCards.map((card, index) => (
                <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <card.icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Admin Team Metrics Section */}
          <section className="space-y-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Team Performance Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminStatCards.filter(c => !c.adminOnly || auth.user.role === 'admin').map((card, index) => (
                <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{card.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                  </div>
                  <div className={`${card.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    <card.icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Content Calendar Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-indigo-200 transition-colors">
                <div className="bg-indigo-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">Posted Content</p>
                  <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">
                    {filteredStats.content_calendar_count}
                    <span className="text-xs font-medium text-gray-400 ml-1.5 italic">this month</span>
                  </h3>
                </div>
              </div>

              {/* Daily Worksheet Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-emerald-200 transition-colors">
                <div className="bg-emerald-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Work Logs</p>
                  <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">
                    {filteredStats.daily_worksheet_count}
                    <span className="text-xs font-medium text-gray-400 ml-1.5 italic">this month</span>
                  </h3>
                </div>
              </div>
            </div>
          </section>

          {/* My Recent Tasks Section */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                My Recent Tasks
              </h3>
              <Link href={route('tasks.index')} className="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentTasks && recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getPriorityColor(task.priority)} bg-opacity-10`}>
                        <Layers className={`w-4 h-4 ${getPriorityColor(task.priority).replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{task.name}</h4>
                        <p className="text-[11px] text-gray-500">Project: {task.project?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(task.status)} text-white`}>
                      {task.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-8 text-center text-xs text-gray-400">No personal tasks assigned yet</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            <AttendanceLargeCard todayAttendance={todayAttendance} />
          </div>

          {/* Quick Links Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href={route('admin.designers-worklist.index')}
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors group text-sm"
              >
                <span className="font-semibold">Manage Worklist</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={route('tasks.index')}
                className="flex items-center justify-between p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors group text-sm"
              >
                <span className="font-semibold">My Task List</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-1">Administrative Help</h3>
            <p className="text-blue-100 text-xs mb-4">Manage team metrics and track performance settings efficiently.</p>
            <button className="w-full py-2.5 bg-white text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Dashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
