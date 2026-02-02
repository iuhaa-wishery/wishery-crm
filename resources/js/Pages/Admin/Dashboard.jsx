import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, Link } from "@inertiajs/react";
import {
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  AlertCircle,
  ChevronRight,
  TrendingUp
} from "lucide-react";

export default function Dashboard({
  stats,
  projectStatusStats,
  taskPriorityStats,
  recentProjects,
  recentTasks
}) {
  const statCards = [
    {
      label: "Total Projects",
      value: stats.total_projects,
      icon: Briefcase,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Total Tasks",
      value: stats.total_tasks,
      icon: Layers,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Total Employees",
      value: stats.total_users,
      icon: Users,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Pending Leaves",
      value: stats.pending_leaves,
      icon: Clock,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50"
    },
  ];

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed") return "bg-green-500";
    if (s === "in progress") return "bg-blue-500";
    if (s === "on hold") return "bg-orange-500";
    return "bg-gray-400";
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase();
    if (p === "high") return "bg-red-500";
    if (p === "medium") return "bg-yellow-500";
    if (p === "low") return "bg-green-500";
    return "bg-gray-400";
  };

  return (
    <div className="p-6 space-y-8">
      <Head title="Admin Dashboard" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 text-lg">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 px-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-700">Real-time Analytics</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Status Chart */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Project Status Distribution
            </h3>
          </div>
          <div className="space-y-6">
            {Object.entries(projectStatusStats).length > 0 ? (
              Object.entries(projectStatusStats).map(([status, count]) => {
                const percentage = (count / stats.total_projects) * 100;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                      <span className="capitalize">{status}</span>
                      <span>{count} Projects ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(status)} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 italic text-center py-10">No project data available</p>
            )}
          </div>
        </div>

        {/* Task Priority Chart */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-purple-600" />
              Task Priority Distribution
            </h3>
          </div>
          <div className="space-y-6">
            {Object.entries(taskPriorityStats).length > 0 ? (
              Object.entries(taskPriorityStats).map(([priority, count]) => {
                const percentage = (count / stats.total_tasks) * 100;
                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold text-gray-700">
                      <span className="capitalize">{priority}</span>
                      <span>{count} Tasks ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPriorityColor(priority)} transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 italic text-center py-10">No task data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Projects</h3>
            <Link href={route('admin.projects.index')} className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getStatusColor(project.status)} bg-opacity-10`}>
                      <Briefcase className={`w-6 h-6 ${getStatusColor(project.status).replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{project.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">Created At</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-10 text-center text-gray-500">No recent projects</p>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Tasks</h3>
            <Link href={route('admin.tasks.index')} className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
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
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(task.priority)} text-white`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-10 text-center text-gray-500">No recent tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Dashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
