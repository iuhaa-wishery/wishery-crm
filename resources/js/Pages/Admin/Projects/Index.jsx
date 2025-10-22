import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Edit, Trash2, Calendar } from "lucide-react";

export default function Index({ projects, success }) {
  const [deleteId, setDeleteId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);

  // Create form
  const {
    data: createData,
    setData: setCreateData,
    post,
    processing: creating,
    reset: resetCreate,
    errors: createErrors,
  } = useForm({
    name: "",
    status: "not started",
    start_date: "",
    end_date: "",
  });

  // Edit form
  const {
    data: updateData,
    setData: setUpdateData,
    put,
    processing: updating,
    reset: resetUpdate,
    errors: updateErrors,
  } = useForm({
    id: "",
    name: "",
    status: "not started",
    start_date: "",
    end_date: "",
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    post(route("admin.projects.store"), {
      onSuccess: () => {
        resetCreate();
        setShowCreate(false);
      },
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!updateData.id) return;
    put(route("admin.projects.update", updateData.id), {
      onSuccess: () => {
        resetUpdate();
        setShowEdit(false);
      },
    });
  };

  const handleDelete = (id) => {
    router.post(route("admin.projects.destroy", id), { _method: "DELETE" });
    setDeleteId(null);
  };

  const rows = projects?.data ?? [];

  return (
    <AdminLayout>
      <Head title="Projects" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Project
        </button>
      </div>

      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Project Cards */}
      {rows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((project) => (
            <div
              key={project.id}
              className="bg-white shadow rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <h2
                  onClick={() =>
                    router.get(route("admin.projects.show", project.id))
                  }
                  className="text-lg font-bold text-blue-600 cursor-pointer hover:underline"
                >
                  {project.name}
                </h2>
                <p className="text-sm mt-1 text-gray-500 capitalize">
                  Status: {project.status}
                </p>
                <div className="flex items-center mt-2 text-sm text-gray-600 space-x-3">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" /> {project.start_date}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" /> {project.end_date}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setUpdateData({
                      id: project.id,
                      name: project.name,
                      status: project.status,
                      start_date: project.start_date,
                      end_date: project.end_date,
                    });
                    setShowEdit(true);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDeleteId(project.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No projects found.</p>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Create Project</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block">Name</label>
                <input
                  type="text"
                  value={createData.name}
                  onChange={(e) => setCreateData("name", e.target.value)}
                  className={`w-full border px-3 py-2 rounded ${
                    createErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {createErrors.name && (
                  <p className="text-red-500 text-sm">{createErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block">Status</label>
                <select
                  value={createData.status}
                  onChange={(e) => setCreateData("status", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="not started">Not Started</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block">Start Date</label>
                  <input
                    type="date"
                    value={createData.start_date}
                    onChange={(e) =>
                      setCreateData("start_date", e.target.value)
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block">End Date</label>
                  <input
                    type="date"
                    value={createData.end_date}
                    onChange={(e) => setCreateData("end_date", e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Project</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block">Name</label>
                <input
                  type="text"
                  value={updateData.name}
                  onChange={(e) => setUpdateData("name", e.target.value)}
                  className={`w-full border px-3 py-2 rounded ${
                    updateErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {updateErrors.name && (
                  <p className="text-red-500 text-sm">{updateErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block">Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData("status", e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="not started">Not Started</option>
                  <option value="in progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block">Start Date</label>
                  <input
                    type="date"
                    value={updateData.start_date}
                    onChange={(e) =>
                      setUpdateData("start_date", e.target.value)
                    }
                    className="w-full border rounded p-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="block">End Date</label>
                  <input
                    type="date"
                    value={updateData.end_date}
                    onChange={(e) => setUpdateData("end_date", e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete this project?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded"
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
