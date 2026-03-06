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
  filters
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

  const allStatCards = [
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

  const statCards = isManager
    ? allStatCards.filter(card => !card.adminOnly)
    : allStatCards;

  return (
    <div className="p-6 space-y-8">
      <Head title="Admin Dashboard" />

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 text-lg">Welcome back! Manage and track team activity.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filters</span>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

          {/* User Filter */}
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

          {/* Month Filter */}
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

          {/* Year Filter */}
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

      {/* Stat Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6`}>
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value}</h3>
            </div>
            <div className={`${card.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-8 h-8 ${card.textColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filtered Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Calendar Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center gap-6 group hover:border-indigo-200 transition-colors">
          <div className="bg-indigo-50 p-6 rounded-3xl group-hover:scale-110 transition-transform">
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

        {/* Daily Worksheet Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center gap-6 group hover:border-emerald-200 transition-colors">
          <div className="bg-emerald-50 p-6 rounded-3xl group-hover:scale-110 transition-transform">
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

Dashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
