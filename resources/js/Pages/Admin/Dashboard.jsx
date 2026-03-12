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

  if (auth.user.role === 'admin') {
    return (
      <div className="p-6 space-y-8">
        <Head title="Admin Dashboard" />

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1 text-lg">Manage and track team activity metrics.</p>
          </div>

          {/* Filters - Admin Only */}
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
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminStatCards.map((card, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value}</h3>
              </div>
              <div className={`${card.bgColor} p-4 rounded-2xl`}>
                <card.icon className={`w-8 h-8 ${card.textColor}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Team Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center gap-6 group">
            <div className="bg-indigo-50 p-6 rounded-3xl">
              <Calendar className="w-12 h-12 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-1">Posted Content</p>
              <h3 className="text-4xl font-extrabold text-gray-900 leading-tight">
                {filteredStats.content_calendar_count}
                <span className="text-lg font-medium text-gray-400 ml-2 italic">Entries this month</span>
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center gap-6 group">
            <div className="bg-emerald-50 p-6 rounded-3xl">
              <FileText className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">Daily Work Logs</p>
              <h3 className="text-4xl font-extrabold text-gray-900 leading-tight">
                {filteredStats.daily_worksheet_count}
                <span className="text-lg font-medium text-gray-400 ml-2 italic">Entries this month</span>
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Manager/Editor View
  return (
    <div className="p-6 space-y-8">
      <Head title="My Dashboard" />

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

          {/* Task & Leave Stats */}
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Secondary Metrics</h2>
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
        </div>

        <div className="space-y-8">
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            <AttendanceLargeCard todayAttendance={todayAttendance} />
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-lg overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">My Worklinks</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Quickly jump to your task list or manage ongoing projects.</p>
              <div className="space-y-3">
                <Link href={route('tasks.index')} className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 text-sm font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-sm">
                  <Layers className="w-4 h-4" /> Go to Task List
                </Link>
                <Link href={route('admin.designers-worklist.index')} className="w-full flex items-center justify-center gap-2 py-3 border border-indigo-400/50 text-white text-sm font-bold rounded-2xl hover:bg-white/10 transition-colors">
                  View Worklist
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

Dashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
