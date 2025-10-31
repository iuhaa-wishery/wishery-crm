import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import axios from 'axios';
import UserLayout from "@/Layouts/UserLayout";
import { Edit, Calendar, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Index() {
    const { tasks } = usePage().props;

    // Initialize task list, handling pagination structure if present
    const [taskList, setTaskList] = useState(
        Array.isArray(tasks)
            ? tasks
            : Array.isArray(tasks?.data)
            ? tasks.data
            : []
    );

    const [selectedTask, setSelectedTask] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [fade, setFade] = useState(false);

    // Synchronize local tasks state when tasks prop changes
    useEffect(() => {
        setTaskList(
            Array.isArray(tasks)
                ? tasks
                : Array.isArray(tasks?.data)
                ? tasks.data
                : []
        );
    }, [tasks]);

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

    const handleStatusUpdate = (e) => {
        e.preventDefault();
        if (!selectedTask || newStatus === selectedTask.status) {
            setSelectedTask(null);
            return;
        }

        const originalTask = selectedTask;
        const originalStatus = selectedTask.status;

        // 1. Optimistic UI Update in Modal
        setTaskList(prevList => prevList.map(t => 
            t.id === originalTask.id ? { ...t, status: newStatus } : t
        ));
        setSelectedTask(null); // Close modal immediately

        // ✅ FIX APPLIED HERE: Manually construct the URL path to bypass Ziggy route context issues
        const updateUrl = `/user/tasks/${originalTask.id}/status`;
        
        axios.put(
            updateUrl, 
            { status: newStatus }
        )
        .then(response => {
            // Success: Display confirmation
            setShowSuccess(true);
            setFade(false);
        })
        .catch(error => {
            // Error: Revert the UI state
            alert("Failed to update status. Please try again.");
            console.error("Update failed:", error);
            setTaskList(prevList => prevList.map(t => 
                t.id === originalTask.id ? { ...t, status: originalStatus } : t
            ));
        });
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const sourceStatus = source.droppableId;
        const destinationStatus = destination.droppableId;
        const taskId = parseInt(draggableId.split('-')[1]);
        const draggedTask = taskList.find(t => t.id === taskId);
        
        if (!draggedTask || sourceStatus === destinationStatus) return;

        // 1. Optimistic UI Update
        const originalTaskList = [...taskList];
        const newTaskList = taskList.map(task => 
            task.id === taskId ? { ...task, status: destinationStatus } : task
        );
        setTaskList(newTaskList);

        // 2. Persist Change to the Backend using Axios
        // ✅ FIX APPLIED HERE: Manually construct the URL path to bypass Ziggy route context issues
        const updateUrl = `/user/tasks/${taskId}/status`;

        axios.put(updateUrl, { 
            status: destinationStatus
        })
        .then(response => {
            // Success: Display success message
            setShowSuccess(true);
            setFade(false);
        })
        .catch(error => {
            // Error: Revert the UI state
            setTaskList(originalTaskList); 
            alert("Failed to update task status. Please try again.");
            console.error("Status update failed:", error);
        });
    };

    const getDaysLeft = (endDate) => {
        if (!endDate) return "";
        const now = new Date();
        const end = new Date(endDate);
        now.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0)
            return <span className="text-red-600 text-sm font-medium">Overdue</span>;
        if (diffDays === 0)
            return <span className="text-yellow-600 text-sm font-medium">Due today</span>;
        return (
            <span className="text-blue-700 text-sm font-medium">{diffDays} days left</span>
        );
    };

    const grouped = statusOrder.reduce((acc, key) => {
        acc[key] = taskList.filter(
            (t) => (t.status || "").toLowerCase() === key
        ).sort((a, b) => a.id - b.id);
        return acc;
    }, {});

    return (
        <UserLayout title="My Tasks">
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">My Tasks</h1>

                {/* Success Message */}
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
                
                {/* Kanban board scrolls horizontally only */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="kanban-scroll-area">
                        <div className="flex gap-6 min-w-max">
                            {statusOrder.map((statusKey) => (
                                <Droppable droppableId={statusKey} key={statusKey}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            key={statusKey}
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
                                                                    className={`p-5 rounded-2xl shadow-sm hover:shadow-md transition cursor-grab ${bgByStatus[statusKey]} ${
                                                                        snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''
                                                                    }`}
                                                                >
                                                                    {/* Task Header */}
                                                                    <div className="flex justify-between items-start">
                                                                        <h3 className="font-semibold text-gray-800">
                                                                            {task.name || "Untitled Task"}
                                                                        </h3>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedTask(task);
                                                                                setNewStatus(task.status);
                                                                            }}
                                                                            className="text-gray-500 hover:text-blue-600"
                                                                            title="Edit Status"
                                                                        >
                                                                            <Edit className="w-4 h-4" />
                                                                        </button>
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

                                                                    <div className="mt-2">
                                                                        {getDaysLeft(task.end_date)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-400 text-sm p-4 border border-dashed rounded-xl text-center">
                                                        No tasks
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
            </div>

            {/* Updated Popup Modal (Admin/System Style) */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div 
                        // Updated style: Larger max-w-lg, elevated shadow-2xl, and clean white background
                        className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl relative transform transition-all duration-300 scale-100 opacity-100"
                    >
                        <button
                            onClick={() => setSelectedTask(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2">
                            Update Task Status
                        </h2>

                        <form onSubmit={handleStatusUpdate} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 mb-1 font-semibold text-lg">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={selectedTask.name || ""}
                                    disabled
                                    className="w-full border-2 border-gray-200 rounded-lg p-3 bg-gray-50 cursor-not-allowed text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-semibold text-lg">
                                    Description
                                </label>
                                <textarea
                                    value={selectedTask.description || "No description provided"}
                                    disabled
                                    className="w-full border-2 border-gray-200 rounded-lg p-3 bg-gray-50 cursor-not-allowed text-gray-600"
                                    rows="4"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-2 font-semibold text-lg">
                                    Change Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full border-2 border-blue-300 rounded-lg p-3 bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
                                >
                                    <option value="not started">Not Started</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="on hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            
                            {/* Read-only Date Info */}
                            <div className="flex justify-between gap-6 text-sm pt-2 border-t mt-4">
                                <div className="flex-1">
                                    <label className="block text-gray-600 mb-1 font-medium">Start Date</label>
                                    <p className="text-gray-800 bg-gray-50 p-2 rounded-md">{selectedTask.start_date || "-"}</p>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-gray-600 mb-1 font-medium">End Date</label>
                                    <p className="text-gray-800 bg-gray-50 p-2 rounded-md">{selectedTask.end_date || "-"}</p>
                                </div>
                            </div>


                            <button
                                type="submit"
                                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-md hover:shadow-lg"
                            >
                                Update Status
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Style Fix for Horizontal Scrolling */}
            <style>{`
                .kanban-scroll-area {
                    overflow-x: auto;
                    overflow-y: hidden;
                    width: 100%;
                    padding-bottom: 1rem;
                    /* Customize scrollbar appearance */
                    scrollbar-width: thin;
                    scrollbar-color: #9ca3af transparent;
                }
                .kanban-scroll-area::-webkit-scrollbar {
                    height: 8px;
                }
                .kanban-scroll-area::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 4px;
                }
                .kanban-scroll-area::-webkit-scrollbar-track {
                    background: transparent;
                }
            `}</style>
        </UserLayout>
    );
}
