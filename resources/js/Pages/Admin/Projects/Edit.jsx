import React from "react";
import { Head, useForm, Link } from "@inertiajs/react";

export default function EditProject({ project }) {
  const { data, setData, put, processing, errors } = useForm({
    name: project.name || "",
    description: project.description || "",
    status: project.status || "not started",
    start_date: project.start_date || "",
    end_date: project.end_date || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/admin/projects/${project.id}`);
  };

  return (
    <>
      <Head title="Edit Project" />
      <div className="container mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-4">Edit Project</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block mb-1 font-semibold">Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              {errors.name && (
                <div className="text-red-600 text-sm">{errors.name}</div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1 font-semibold">Description</label>
              <textarea
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              {errors.description && (
                <div className="text-red-600 text-sm">{errors.description}</div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 font-semibold">Status</label>
              <select
                value={data.status}
                onChange={(e) => setData("status", e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="not started">Not Started</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on hold">On Hold</option>
              </select>
              {errors.status && (
                <div className="text-red-600 text-sm">{errors.status}</div>
              )}
            </div>

            {/* Dates */}
            <div>
              <label className="block mb-1 font-semibold">Start Date</label>
              <input
                type="date"
                value={data.start_date}
                onChange={(e) => setData("start_date", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              {errors.start_date && (
                <div className="text-red-600 text-sm">{errors.start_date}</div>
              )}
            </div>
            <div>
              <label className="block mb-1 font-semibold">End Date</label>
              <input
                type="date"
                value={data.end_date}
                onChange={(e) => setData("end_date", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              {errors.end_date && (
                <div className="text-red-600 text-sm">{errors.end_date}</div>
              )}
            </div>

           {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Update
            </button>
            <Link
              href="/admin/projects"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </Link>
          </div>
