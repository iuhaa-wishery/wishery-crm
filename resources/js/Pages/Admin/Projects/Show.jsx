import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Edit, Trash2 } from "lucide-react";

export default function Show() {
  const { project, tasks: initialTasks, users } = usePage().props;

  const [tasks, setTasks] = useState(initialTasks || []);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    name: "",
    assignee_id: "",
    start_date: "",
    end_date: "",
    status: "not started",
    priority: "medium",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const columns = {
    "not started": "To Do",
    "in progress": "In Progress",
    "on hold": "On Hold",
    completed: "Completed",
  };

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
    if (!form.assignee_id) newErrors.assignee_id = "Assignee is required.";
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

    if (editingTask) {
      router.post(
        route("admin.tasks.update", editingTask.id),
        { _method: "PUT", ...form },
        {
          onSuccess: () => {
            // Update task locally
            setTasks((prev) =>
              prev.map((t) => (t.id === editingTask.id ? { ...t, ...form } : t))
            );
            closeModal();
          },
          onError: (err) => setErrors(err),
        }
      );
    } else {
      router.post(
        route("admin.tasks.store"),
        { ...form, project_id: project.id },
        {
          onSuccess: (page) => {
            setTasks(page.props.tasks); // update tasks from backend
            closeModal();
          },
          onError: (err) => setErrors(err),
        }
      );
    }
  };


  const confirmDeleteTask = (id) => {
    setDeleteTaskId(id);
  };

  const handleConfirmDeleteTask = () => {
    router.post(route("admin.tasks.destroy", deleteTaskId), { _method: "DELETE" }, {
      onSuccess: () => {
        setTasks(tasks.filter((t) => t.id !== deleteTaskId));
      }
    });
    setDeleteTaskId(null);
  };

  const handleStatusChange = (taskId, newStatus) => {
    router.post(
      route("admin.tasks.status", taskId),
      { _method: "PUT", status: newStatus },
      {
        onSuccess: () => {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
          );
        },
      }
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">{project?.name || "Project"}</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Task
          </button>
        </div>

        {Object.entries(columns).map(([status, label]) => (
          <div key={status} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{label}</h2>
            {tasks.filter((t) => t.status === status).length === 0 ? (
              <p className="text-gray-500 italic">No tasks</p>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="p-2">Name</th>
                    <th className="p-2">Assignee</th>
                    <th className="p-2">Start</th>
                    <th className="p-2">End</th>
                    <th className="p-2">Priority</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .filter((t) => t.status === status)
                    .map((task) => (
                      <tr key={task.id} className="border-t hover:bg-gray-50">
                        <td className="p-2">{task.name}</td>
                        <td className="p-2">{task.assignee?.name || "Unassigned"}</td>
                        <td className="p-2">{task.start_date}</td>
                        <td className="p-2">{task.end_date}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </td>
                        <td className="p-2">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task.id, e.target.value)
                            }
                            className="border rounded px-2 py-1"
                          >
                            {Object.keys(columns).map((key) => (
                              <option key={key} value={key}>
                                {columns[key]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 space-x-2">
                          <button
                            onClick={() => openModal(task)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => confirmDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        ))}

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block">Task Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full border px-3 py-2 rounded ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div>
                  <label className="block">Assignee</label>
                  <select
                    name="assignee_id"
                    value={form.assignee_id}
                    onChange={handleChange}
                    className={`w-full border px-3 py-2 rounded ${
                      errors.assignee_id ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">-- Select User --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {errors.assignee_id && (
                    <p className="text-red-500 text-sm">{errors.assignee_id}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className={`w-full border px-3 py-2 rounded ${
                        errors.start_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      className={`w-full border px-3 py-2 rounded ${
                        errors.end_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    {Object.keys(columns).map((key) => (
                      <option key={key} value={key}>
                        {columns[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block">Priority</label>
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
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    {editingTask ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      {deleteTaskId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this task?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteTaskId(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteTask}
                className="px-4 py-2 bg-red-600 text-white rounded"
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
