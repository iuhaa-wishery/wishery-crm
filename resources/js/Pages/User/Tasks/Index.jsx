import React, { useState, useEffect } from "react";
// Import 'route' from the global window object or ensure it's accessible via window
const route = window.route;
import { usePage, router, Link } from "@inertiajs/react";
import UserLayout from "@/Layouts/UserLayout";
import { Edit, Calendar, X, Eye } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Helper: format date string to YYYY-MM-DD (works with ISO or plain date strings)
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    // Fallback for non-ISO dates, ensuring we don't return "NaN"
    if (isNaN(d.getTime())) return dateString.split("T")[0] || dateString;
    return d.toISOString().split("T")[0];
  } catch (e) {
    return dateString;
  }
};

export default function UserTasks() {
  const { tasks, users } = usePage().props;

  // Normalize incoming tasks (support array, paginated object, or undefined)
  const initialTasks = Array.isArray(tasks)
    ? tasks
    : Array.isArray(tasks?.data)
      ? tasks.data
      : [];

  const [taskList, setTaskList] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    setTaskList(
      Array.isArray(tasks)
        ? tasks
        : Array.isArray(tasks?.data)
          ? tasks.data
          : []
    );
  }, [tasks]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setFade(true);
        setTimeout(() => setShowSuccess(false), 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

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
  const priorityColors = {
    'High': 'text-red-600',
    'Medium': 'text-yellow-600',
    'Low': 'text-green-600',
  };

  // Robust parse for draggableId - ensures we get a numeric ID
  const parseDraggableId = (draggableId) => {
    if (!draggableId) return null;
    // Handles both 'task-123' and '123'
    const maybeId = String(draggableId).split("-").pop();
    const n = Number(maybeId);
    return Number.isNaN(n) ? null : n;
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId && source.index === destination.index)
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;

    const taskId = parseDraggableId(draggableId);

    // CRITICAL CHECK: Ensure taskId is valid before proceeding
    if (!taskId) {
      console.error("Could not parse valid taskId from draggableId:", draggableId);
      return;
    }

    const draggedTask = taskList.find((t) => Number(t.id) === taskId);
    if (!draggedTask || sourceStatus === destinationStatus) return;

    // Optimistic update
    const originalTaskList = [...taskList];
    const newTaskList = taskList.map((task) =>
      Number(task.id) === taskId ? { ...task, status: destinationStatus } : task
    );
    setTaskList(newTaskList);

    // 🎯 FIX: Use the route() helper to generate the URL
    const updateUrl = route('tasks.updateStatus', taskId);

    // Using POST with method spoofing
    router.post(
      updateUrl,
      {
        status: destinationStatus,
        _method: 'put',
      },
      {
        // Inertia options:
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setShowSuccess(true);
          setFade(false);
        },
        onError: (errors) => {
          console.error("Status update failed:", errors);
          setTaskList(originalTaskList); // Revert optimistic update
          alert("Failed to update task status. Please try again.");
        },
      }
    );
  };

  const handleModalStatusUpdate = (e) => {
    e.preventDefault();

    if (!selectedTask) return;

    const taskId = selectedTask.id;
    const statusToUpdate = newStatus;

    // Optimistic update for the modal change
    const originalTaskList = [...taskList];
    const newTaskList = taskList.map((task) =>
      Number(task.id) === taskId ? { ...task, status: statusToUpdate } : task
    );
    setTaskList(newTaskList);
    setSelectedTask(null); // Close modal

    // 🎯 FIX: Use the route() helper to generate the URL
    const updateUrl = route('tasks.updateStatus', taskId);

    // Using POST with method spoofing
    router.post(
      updateUrl,
      {
        status: statusToUpdate,
        _method: 'put',
      },
      {
        // Inertia options:
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setShowSuccess(true);
          setFade(false);
        },
        onError: (errors) => {
          console.error("Status update failed:", errors);
          setTaskList(originalTaskList); // Revert optimistic update
          alert("Failed to update task status in modal. Please try again.");
        },
      }
    );
  };


  const getDaysLeft = (endDate) => {
    if (!endDate) return "";
    const now = new Date();
    const end = new Date(endDate);
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-red-600 text-sm font-medium">Overdue</span>;
    if (diffDays === 0) return <span className="text-yellow-600 text-sm font-medium">Due today</span>;
    return <span className="text-blue-700 text-sm font-medium">{diffDays} days left</span>;
  };

  const grouped = statusOrder.reduce((acc, key) => {
    acc[key] = taskList
      .filter((t) => (t.status || "").toLowerCase() === key)
      .sort((a, b) => Number(a.id) - Number(b.id));
    return acc;
  }, {});

  return (
    <UserLayout title="My Tasks">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Tasks</h1>

        {showSuccess && (
          <div
            className={`mb-4 flex justify-between items-center bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-400 transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"
              }`}
          >
            <span>Task status updated successfully!</span>
            <button
              onClick={() => {
                setShowSuccess(false);
                setFade(false);
              }}
              className="text-green-700 hover:text-green-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-scroll-area">
            <div className="flex gap-6 min-w-max">
              {statusOrder.map((statusKey) => (
                <Droppable droppableId={statusKey} key={statusKey}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-shrink-0 w-[320px] rounded-2xl shadow p-5 ${snapshot.isDraggingOver ? "bg-gray-100" : "bg-white"
                        }`}
                    >
                      <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        {columns[statusKey]} ({grouped[statusKey].length})
                      </h2>

                      <div className="space-y-4 min-h-[50px]">
                        {grouped[statusKey].length > 0 ? (
                          grouped[statusKey].map((task, index) => (
                            <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...provided.draggableProps.style,
                                  }}
                                  className={`p-5 rounded-2xl shadow-sm hover:shadow-md transition cursor-grab ${bgByStatus[statusKey]} ${snapshot.isDragging ? "shadow-xl ring-2 ring-blue-500" : ""
                                    }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <Link href={route('tasks.show', task.id)} className="font-semibold text-gray-800 hover:text-blue-600 transition">
                                      {task.name || "Untitled Task"}
                                    </Link>
                                    <div className="flex gap-2">
                                      <Link
                                        href={route('tasks.show', task.id)}
                                        className="text-gray-500 hover:text-blue-600"
                                        title="View Details"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Link>
                                      <button
                                        onClick={() => {
                                          setSelectedTask(task);
                                          setNewStatus(task.status || "not started");
                                        }}
                                        className="text-gray-500 hover:text-blue-600"
                                        title="Edit Status"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{task.description || "No description provided."}</p>

                                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>{formatDate(task.start_date) || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>{formatDate(task.end_date) || "-"}</span>
                                    </div>
                                  </div>

                                  <div className="mt-2">{getDaysLeft(task.end_date)}</div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm p-4 border border-dashed rounded-xl text-center">No tasks</p>
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
      </div>
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border-t-4 border-blue-600">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-2xl font-bold text-gray-800 flex-1">
                {selectedTask.name || "Task Details"}
              </h2>
              <span className="text-sm font-medium text-blue-600 ml-3 whitespace-nowrap">
                {(() => {
                  const now = new Date();
                  const end = new Date(selectedTask.end_date);
                  now.setHours(0, 0, 0, 0);
                  end.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil(
                    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  if (diffDays < 0) return "Overdue";
                  if (diffDays === 0) return "Due today";
                  return `${diffDays} days remaining`;
                })()}
              </span>
              <button
                onClick={() => setSelectedTask(null)}
                className="ml-4 text-gray-400 hover:text-red-500 transition"
                title="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleModalStatusUpdate} className="flex flex-col flex-1">
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* Description Scrollable */}
                  <div>
                    <label className="block text-gray-600 mb-1 font-semibold">
                      Description
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg border max-h-40 overflow-y-auto text-sm whitespace-pre-wrap">
                      {selectedTask.description || "No description provided."}
                    </div>
                  </div>

                  {/* Priority, Dates, Status */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">
                        Priority
                      </label>
                      <p
                        className={`font-bold p-3 rounded-lg border bg-gray-50 ${priorityColors[selectedTask.priority] || "text-gray-600"
                          }`}
                      >
                        {selectedTask.priority || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">
                        Start Date
                      </label>
                      <p className="font-medium p-3 rounded-lg border bg-gray-50">
                        {formatDate(selectedTask.start_date)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">
                        End Date
                      </label>
                      <p className="font-medium p-3 rounded-lg border bg-gray-50">
                        {formatDate(selectedTask.end_date)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1 font-semibold">
                        Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full p-3 rounded-lg border-2 border-blue-300 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-gray-50"
                      >
                        <option value="not started">To Do</option>
                        <option value="in progress">In Progress</option>
                        <option value="on hold">On Hold</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer (Buttons only) */}
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
                .kanban-scroll-area {
                    overflow-x: auto;
                    overflow-y: hidden;
                    width: 100%;
                    padding-bottom: 1rem;
                    scrollbar-width: thin;
                    scrollbar-color: #9ca3af transparent;
                }
                .kanban-scroll-area::-webkit-scrollbar { height: 8px; }
                .kanban-scroll-area::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
                .kanban-scroll-area::-webkit-scrollbar-track { background: transparent; }
            `}</style>
    </UserLayout>
  );
}
