import React, { useState, useEffect, useRef } from "react";
import { usePage, router } from "@inertiajs/react";
import axios from 'axios';
import AdminLayout from "@/Layouts/AdminLayout";
import { Edit, Trash2, Calendar, X, ChevronDown } from "lucide-react"; // Added ChevronDown
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Helper function to format date to YYYY-MM-DD for date input
const formatDate = (dateString) => {
  if (!dateString) return "";
  return dateString.split("T")[0].split(" ")[0];
};

export default function Show() {
  const { project, tasks: initialTasks, users } = usePage().props;

  // Ref for the custom assignee dropdown to handle outside clicks
  const dropdownRef = useRef(null);

  const [tasks, setTasks] = useState(initialTasks || []);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fade, setFade] = useState(false);
  
  // 💡 NEW STATE for dropdown visibility
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false); 

  const [form, setForm] = useState({
    name: "",
    description: "",
    assignee_ids: [],
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

  // Synchronize local tasks state when initialTasks prop changes
  useEffect(() => setTasks(initialTasks || []), [initialTasks]);

  // Handle success message fading
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setFade(true);
        setTimeout(() => setShowSuccess(false), 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Handle click outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAssigneeDropdownOpen(false);
      }
    }
    // Only add listener if the modal is open
    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
  // 💡 Function to toggle the custom dropdown
  const toggleAssigneeDropdown = () => {
    setIsAssigneeDropdownOpen(prev => !prev);
  }

  const openModal = (task = null) => {
    // Reset dropdown state
    setIsAssigneeDropdownOpen(false); 

    if (task) {
      setEditingTask(task);
      
      // 💡 FIX 1A: Extract IDs from the 'assignees' relationship array
      const currentAssigneeIds = Array.isArray(task.assignees)
          ? task.assignees.map(a => String(a.id)) // Map the User objects to string IDs
          : [];
      
      setForm({
        name: task.name || "",
        description: task.description || "",
        assignee_ids: currentAssigneeIds, // <-- Now uses the mapped IDs
        start_date: formatDate(task.start_date) || "",
        end_date: formatDate(task.end_date) || "",
        status: task.status || "not started",
        priority: task.priority || "medium",
      });
    } else {
      setEditingTask(null);
      setForm({
        name: "",
        description: "",
        assignee_ids: [],
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
  
  // Handler for multi-select checkboxes (used inside the dropdown)
  const handleAssigneeChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const newAssigneeIds = checked
        ? [...prev.assignee_ids, value]
        : prev.assignee_ids.filter((id) => id !== value);
      
      return { ...prev, assignee_ids: newAssigneeIds };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Task name is required.";
    if (!form.start_date) newErrors.start_date = "Start date is required.";
    if (!form.end_date) newErrors.end_date = "End date is required.";
    if (form.start_date && form.end_date && form.end_date < form.start_date)
      newErrors.end_date = "End date cannot be before start date.";
    
    if (form.assignee_ids.length === 0) newErrors.assignee_ids = "At least one Assignee is required.";
    
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
      ? { _method: "PUT", project_id: project.id, ...form }
      : { ...form, project_id: project.id };

    router.post(routeName, payload, {
      preserveScroll: true,
      onSuccess: (page) => {
        if (page.props?.tasks) setTasks(page.props.tasks);
        setShowSuccess(true);
        setFade(false); 
        closeModal();
      },
      onError: (err) => setErrors(err),
    });
  };

  const handleDelete = () => {
    router.delete(route("admin.tasks.destroy", deleteTaskId), {
      preserveScroll: true,
      onSuccess: (page) => {
        if (page.props?.tasks) setTasks(page.props.tasks);
        setShowSuccess(true);
        setFade(false); 
      },
    });
    setDeleteTaskId(null);
  };

  const grouped = statusOrder.reduce((acc, key) => {
    acc[key] = tasks.filter((t) => (t.status || "").toLowerCase() === key).sort((a, b) => a.id - b.id);
    return acc;
  }, {});

  const getDaysLeft = (endDate) => {
    if (!endDate) return "";
    const now = new Date();
    const end = new Date(formatDate(endDate));
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <span className="text-red-600 font-bold">Overdue</span>;
    if (diffDays === 0)
      return <span className="text-yellow-600 font-bold">Due today</span>;
    return <span className="text-blue-700 font-bold">{diffDays} days left</span>;
  };
  
  const getAssigneeUsers = (task) => {
    if (Array.isArray(task.assignees) && task.assignees.length > 0) {
        return task.assignees; 
    }
    return [];
  };

  const getAvatarUrl = (user) => {
    const basePath = import.meta.env.VITE_BASE_URL;

    if (user?.image) {
      return user.image.startsWith("http")
        ? user.image
        : `${basePath}/storage/${user.image}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "U"
    )}&background=random&color=fff`;
  };

  // Drag and Drop Handler remains unchanged
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;
    const taskId = parseInt(draggableId.split('-')[1]);
    const draggedTask = tasks.find(t => t.id === taskId);
    
    if (!draggedTask) return;

    // 1. Optimistic UI Update (Save the original state for rollback)
    const originalTasks = [...tasks];
    const newTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: destinationStatus } : task
    );
    setTasks(newTasks);

    // 2. Persist Change to the Backend using Axios
    if (sourceStatus !== destinationStatus) {
      axios.put(route("admin.tasks.status", taskId), { 
        status: destinationStatus
      })
      .then(response => {
        setShowSuccess(true);
        setFade(false);
      })
      .catch(error => {
        setTasks(originalTasks); 
        alert("Failed to update task status. Please check server logs.");
        console.error("Status update failed:", error);
      });
    } 
  };
  
  // Helper to get selected user names for display in the dropdown header
  const getSelectedAssigneeNames = () => {
      const selectedUsers = users?.filter(u => form.assignee_ids.includes(String(u.id)));
      if (!selectedUsers || selectedUsers.length === 0) {
          return "Select Assignee(s)";
      }
      
      const names = selectedUsers.map(u => u.name);
      
      if (names.length > 2) {
          return `${names[0]}, ${names[1]} (+${names.length - 2} more)`;
      }
      return names.join(', ');
  }


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
            <span>Task status updated successfully!</span>
            <button
              onClick={() => { setShowSuccess(false); setFade(false); }}
              className="text-green-700 hover:text-green-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Kanban Context (unchanged) */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {statusOrder.map((statusKey) => (
                <Droppable droppableId={statusKey} key={statusKey}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-shrink-0 w-[320px] rounded-2xl shadow p-5 ${
                        snapshot.isDraggingOver ? "bg-gray-100" : "bg-white"
                      }`}
                    >
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        {columns[statusKey]} ({grouped[statusKey].length})
                      </h2>

                      <div className="space-y-4 min-h-[50px]">
                        {grouped[statusKey].length > 0 ? (
                          grouped[statusKey].map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={`task-${task.id}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-5 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer ${bgByStatus[statusKey]} ${
                                    snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-800">
                                      {task.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openModal(task)}
                                        className="text-gray-600 hover:text-blue-700 p-1 rounded-full hover:bg-white/50"
                                        title="Edit Task"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteTaskId(task.id)}
                                        className="text-gray-600 hover:text-red-600 p-1 rounded-full hover:bg-white/50"
                                        title="Delete Task"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                                    {task.description || "No description provided."}
                                  </p>

                                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      <span>{formatDate(task.start_date) || "-"}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      <span>{formatDate(task.end_date) || "-"}</span>
                                    </div>
                                  </div>

                                  <div className="mt-2 text-sm font-medium">
                                    {getDaysLeft(task.end_date)}
                                  </div>

                                  <div className="mt-3 flex items-center justify-between">
                                    {/* Display multiple assignees/avatars */}
                                    <div className="flex items-center">
                                        <div className="flex -space-x-2 overflow-hidden">
                                        {getAssigneeUsers(task).slice(0, 3).map((user) => (
                                            <img
                                                key={user.id}
                                                src={getAvatarUrl(user)}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-md transition hover:z-10"
                                                title={user.name}
                                            />
                                        ))}
                                        {getAssigneeUsers(task).length > 3 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-xs text-white shadow-md">
                                                +{getAssigneeUsers(task).length - 3}
                                            </div>
                                        )}
                                        {getAssigneeUsers(task).length === 0 && (
                                            <span className="text-sm text-gray-500 italic">Unassigned</span>
                                        )}
                                        </div>
                                    </div>
                                    
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
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm p-4 border border-dashed rounded-xl text-center">
                            No tasks in this column.
                          </p>
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </DragDropContext>

        {/* ✅ Add/Edit Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-8 z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl mt-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingTask ? "Edit Task" : "Add Task"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium mb-1 text-gray-700">Task Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g. Implement user authentication"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={form.description || ""}
                    onChange={handleChange}
                    className={`w-full border px-3 py-2 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    rows="4"
                    placeholder="Enter detailed task description..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">Assignees</label>
                    {/* 💡 CUSTOM MULTI-SELECT DROPDOWN */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={toggleAssigneeDropdown}
                            className={`w-full flex justify-between items-center bg-white px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.assignee_ids ? "border-red-500" : "border-gray-300"
                            }`}
                        >
                            <span className="truncate pr-4 text-gray-700">
                                {getSelectedAssigneeNames()}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                isAssigneeDropdownOpen ? 'rotate-180' : 'rotate-0'
                            }`} />
                        </button>
                        
                        {isAssigneeDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {users?.map((user) => (
                                    <div 
                                        key={user.id} 
                                        className="flex items-center p-2 hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => { /* clicking div toggles checkbox */
                                            const syntheticEvent = { target: { value: String(user.id), checked: !form.assignee_ids.includes(String(user.id)) } };
                                            handleAssigneeChange(syntheticEvent);
                                        }}
                                    >
                                        <input
                                          id={`user-dropdown-${user.id}`}
                                          type="checkbox"
                                          name="assignee_ids"
                                          value={String(user.id)}
                                          // 💡 FIX 2: Ensure ID comparison is consistent (String(user.id) vs form.assignee_ids items which are strings)
                                          checked={form.assignee_ids.includes(String(user.id))} 
                                          onChange={handleAssigneeChange}
                                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                          onClick={(e) => e.stopPropagation()} 
                                      />                                        <label
                                            htmlFor={`user-dropdown-${user.id}`}
                                            className="ml-2 text-sm font-medium text-gray-700 flex items-center flex-grow cursor-pointer"
                                        >
                                            <img
                                                src={getAvatarUrl(user)}
                                                alt="avatar"
                                                className="w-6 h-6 rounded-full border mr-2 object-cover"
                                            />
                                            {user.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {errors.assignee_ids && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.assignee_ids}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium mb-1 text-gray-700">Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full border px-3 py-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                    >
                      {statusOrder.map((status) => (
                        <option key={status} value={status}>
                          {columns[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.start_date
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.start_date && (
                        <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-700">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date}
                      onChange={handleChange}
                      className={`w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.end_date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {(errors.end_date && errors.end_date !== "End date cannot be before start date.") && (
                        <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                    )}
                    {(errors.end_date && errors.end_date === "End date cannot be before start date.") && (
                        <p className="text-red-500 text-sm mt-1">Date must be on or after start date.</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-gray-700">Priority</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
                  >
                    {editingTask ? "Update Task" : "Save Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation (unchanged) */}
        {deleteTaskId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h2>
              <p className="mb-6 text-gray-700">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteTaskId(null)}
                  className="px-5 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md font-medium"
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