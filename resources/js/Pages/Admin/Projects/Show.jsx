import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Edit, Trash2, Calendar, X } from "lucide-react";

export default function Show() {
  const { project, tasks: initialTasks, users } = usePage().props;

  const [tasks, setTasks] = useState(initialTasks || []);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fade, setFade] = useState(false);
  const [form, setForm] = useState({
    name: "",
    assignee_id: "",
    start_date: "",
    end_date: "",
    status: "not started",
    priority: "medium",
  });
  const [errors, setErrors] = useState({});

  const statusOrder = ["not started", "in progress", "on hold", "completed"];
  const columns = {
    "not started": "To Do",
    "in progress": "In Progress",
    "on hold": "On Hold",
    completed: "Completed",
  };

  const bgByStatus = {
    "not started": "bg-blue-100",
    "in progress": "bg-green-100",
    "on hold": "bg-orange-100",
    completed: "bg-gray-200",
  };

  useEffect(() => setTasks(initialTasks), [initialTasks]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setFade(true);
        setTimeout(() => setShowSuccess(false), 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setForm({
        name: task.name || "",
        assignee_id: task.assignee_id || "",
        start_date: task.start_date || "",
        end_date: task.end_date || "",
        status: task.status || "not started",
        priority: task.priority || "medium",
      });
    } else {
      setEditingTask(null);
      setForm({
        name: "",
        assignee_id: "",
        start_date: "",
        end_date: "",
        status: "not started",
        priority: "medium",
      });
    }
    setErrors({});
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Task name is required.";
    if (!form.start_date) newErrors.start_date = "Start date is required.";
    if (!form.end_date) newErrors.end_date = "End date is required.";
    if (form.start_date && form.end_date && form.end_date < form.start_date)
      newErrors.end_date = "End date cannot be before start date.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const routeName = editingTask
      ? route("admin.tasks.update", editingTask.id)
      : route("admin.tasks.store");

    const payload = editingTask
      ? { _method: "PUT", ...form }
      : { ...form, project_id: project.id };

    router.post(routeName, payload, {
      onSuccess: (page) => {
        setTasks(page.props.tasks || []);
        setShowSuccess(true);
        closeModal();
      },
      onError: (err) => setErrors(err),
    });
  };

  const handleDelete = () => {
    router.post(
      route("admin.tasks.destroy", deleteTaskId),
      { _method: "DELETE" },
      {
        onSuccess: (page) => {
          setTasks(page.props.tasks || []);
          setShowSuccess(true);
        },
      }
    );
    setDeleteTaskId(null);
  };

  const grouped = statusOrder.reduce((acc, key) => {
    acc[key] = tasks.filter((t) => (t.status || "").toLowerCase() === key);
    return acc;
  }, {});

  const getDaysLeft = (endDate) => {
    if (!endDate) return "";
    const now = new Date();
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return <span className="text-red-600">Overdue</span>;
    if (diffDays === 0)
      return <span className="text-yellow-600">Due today</span>;
    return <span className="text-blue-700">{diffDays} days left</span>;
  };

  // ✅ Correct avatar getter (matches your working users table)
  const getAvatarUrl = (task) => {
    const user = users?.find((u) => u.id === task.assignee_id);
    if (user?.image_url) {
      return user.image_url.startsWith("http")
        ? user.image_url
        : `/storage/${user.image_url}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}`;
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {project?.name || "Project"}
          </h1>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Add Task
          </button>
        </div>

        {/* ✅ Success Message */}
        {showSuccess && (
          <div
            className={`mb-4 flex justify-between items-center bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-400 transition-opacity duration-500 ${
              fade ? "opacity-0" : "opacity-100"
            }`}
          >
            <span>Task updated successfully!</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-green-700 hover:text-green-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ✅ Horizontal Scroll Columns */}
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max">
            {statusOrder.map((statusKey) => (
              <div
                key={statusKey}
                className="flex-shrink-0 w-[300px] bg-white rounded-2xl shadow p-5"
              >
                <h2 className="text-xl font-semibold mb-4">
                  {columns[statusKey]}
                </h2>

                <div className="space-y-4">
                  {grouped[statusKey].length > 0 ? (
                    grouped[statusKey].map((task) => (
                      <div
                        key={task.id}
                        className={`p-5 rounded-2xl shadow-sm hover:shadow-md transition ${bgByStatus[statusKey]}`}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-800">
                            {task.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(task)}
                              className="text-gray-600 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTaskId(task.id)}
                              className="text-gray-600 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{task.start_date || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{task.end_date || "-"}</span>
                          </div>
                        </div>

                        <div className="mt-2 text-sm font-medium">
                          {getDaysLeft(task.end_date)}
                        </div>

                        {/* ✅ Avatar + Priority */}
                        <div className="mt-3 flex items-center justify-between">
                          <img
                            src={getAvatarUrl(task)}
                            alt="avatar"
                            className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://ui-avatars.com/api/?name=User";
                            }}
                          />
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              task.priority === "high"
                                ? "bg-red-200 text-red-800"
                                : task.priority === "medium"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-green-200 text-green-800"
                            }`}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No tasks</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Create / Edit Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium">Task Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full border px-3 py-2 rounded ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium">Assignee</label>
                  <select
                    name="assignee_id"
                    value={form.assignee_id}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Select Assignee</option>
                    {users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block font-medium">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className={`w-full border rounded p-2 ${
                        errors.start_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-medium">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      className={`w-full border rounded p-2 ${
                        errors.end_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium">Priority</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2">
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
                    {editingTask ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ Delete Confirmation */}
        {deleteTaskId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
              <p className="mb-4">Are you sure you want to delete this task?</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setDeleteTaskId(null)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
