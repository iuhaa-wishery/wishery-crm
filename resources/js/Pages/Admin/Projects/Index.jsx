import React, { useState, useEffect } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Edit, Trash2, Eye, X } from "lucide-react";

export default function Index({ projects, users, success }) {
  const [deleteId, setDeleteId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showSuccess, setShowSuccess] = useState(!!success);
  const [fade, setFade] = useState(false);

  const { data: form, setData, post, put, reset, errors, clearErrors } = useForm({
    name: "",
    description: "",
    status: "not started",
    start_date: "",
    end_date: "",
    priority: "Medium",
  });

  const rows = Array.isArray(projects) ? projects : projects?.data ?? [];

  useEffect(() => {
    if (success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setFade(true);
        setTimeout(() => setShowSuccess(false), 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const openCreateModal = () => {
    reset();
    setEditingProject(null);
    setShowCreate(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setData({
      name: project.name,
      description: project.description || "",
      status: project.status || "not started",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      priority: project.priority || "Medium",
    });
    setShowEdit(true);
  };

  const closeModal = () => {
    reset();
    clearErrors();
    setShowCreate(false);
    setShowEdit(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      put(route("admin.projects.update", editingProject.id), {
        preserveScroll: true,
        onSuccess: () => {
          closeModal();
        },
        onError: (errors) => {
          console.log("Validation errors:", errors);
        },
      });
    } else {
      post(route("admin.projects.store"), {
        preserveScroll: true,
        onSuccess: () => {
          closeModal();
        },
        onError: (errors) => {
          console.log("Validation errors:", errors);
        },
      });
    }
  };

  const handleDelete = (id) => {
    router.post(route("admin.projects.destroy", id), { _method: "DELETE" });
    setDeleteId(null);
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "completed" || s === "finished")
      return (
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm">
          Finished
        </span>
      );
    if (s === "in progress")
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
          In Progress
        </span>
      );
    if (s === "on hold")
      return (
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm">
          On Hold
        </span>
      );
    return (
      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm">
        Pending
      </span>
    );
  };

  return (
    <AdminLayout>
      <Head title="Projects" />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          + New Project
        </button>
      </div>

      {/* ✅ Success message */}
      {showSuccess && (
        <div
          className={`mb-4 flex justify-between items-center bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-400 transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"
            }`}
        >
          <span>{success}</span>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-green-700 hover:text-green-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ✅ Projects Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-50 text-gray-700 text-sm uppercase">
              <th className="p-3 text-left">Project Name</th>
              <th className="p-3 text-left">Start Date</th>
              <th className="p-3 text-left">End Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((project) => (
                <tr
                  key={project.id}
                  className="border-t text-gray-700 hover:bg-gray-100 transition"
                >
                  <td className="p-3 font-semibold text-gray-900 text-[15px] tracking-wide hover:text-blue-600 transition-colors">
                    {project.name}
                  </td>
                  <td className="p-3 text-gray-600">
                    {project.start_date
                      ? new Date(project.start_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      : "-"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {project.end_date
                      ? new Date(project.end_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      : "-"}
                  </td>
                  <td className="p-3">{getStatusBadge(project.status)}</td>
                  <td className="p-3 flex justify-center gap-3">
                    <button
                      onClick={() =>
                        router.get(route("admin.projects.show", project.id))
                      }
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEditModal(project)}
                      className="text-gray-600 hover:text-blue-700"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(project.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic"
                >
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Create / Edit Modal */}
      {(showCreate || showEdit) && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProject ? "Edit Project" : "Create Project"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block font-medium">Project Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className={`w-full border px-3 py-2 rounded ${errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setData("description", e.target.value)}
                  className={`w-full border px-3 py-2 rounded min-h-[100px] ${errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Enter brief project details..."
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setData("status", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="not started">Not Started</option>
                  <option value="in progress">In Progress</option>
                  <option value="on hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Dates */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-medium">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setData("start_date", e.target.value)}
                    className={`w-full border rounded p-2 ${errors.start_date ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block font-medium">End Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setData("end_date", e.target.value)}
                    className={`w-full border rounded p-2 ${errors.end_date ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {editingProject ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete this project?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
