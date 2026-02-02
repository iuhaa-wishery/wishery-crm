import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Edit, Trash2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Index() {
  const { users } = usePage().props;

  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    image: null,
    desktop_only: false,
  });
  const [errors, setErrors] = useState({});

  // Open modal for create or edit
  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        password_confirmation: "",
        role: user.role || "user",
        image: null,
        desktop_only: user.desktop_only || false,
      });
    } else {
      setEditingUser(null);
      setForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "user",
        image: null,
        desktop_only: false,
      });
    }
    setErrors({});
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : type === 'checkbox' ? (checked ? 1 : 0) : value,
    });
  };

  // Validate inputs
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!editingUser) {
      // Only validate email for create
      if (!form.email.trim()) {
        newErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Invalid email address.";
      }
    }

    if (!editingUser && !form.password) {
      newErrors.password = "Password is required.";
    }

    if (form.password && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save user (create or update)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== "") {
        data.append(key, form[key]);
      }
    });

    if (editingUser) {
      router.post(
        route("admin.users.update", editingUser.id),
        { _method: "PUT", ...form },
        { forceFormData: true }
      );
    } else {
      router.post(route("admin.users.store"), form, { forceFormData: true });
    }

    closeModal();
  };

  // Delete user
  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = () => {
    router.post(route("admin.users.destroy", deleteId), { _method: "DELETE" });
    setDeleteId(null);
  };

  // Toggle Desktop Only
  const handleDesktopToggle = (id) => {
    const url = route("admin.users.toggle.desktop", { user: id });

    axios.patch(url)
      .then(() => {
        // Optimistically update local state or reload
        // Since we are using inertia prop 'users', reload is easiest to keep sync
        router.reload({ only: ['users'] });
        toast.success("Desktop restriction updated!");
      })
      .catch(error => {
        console.error("Error toggling desktop restriction:", error);
        toast.error("Failed to update desktop restriction.");
      });
  };

  // Toggle active/inactive
  const handleToggle = (id) => {
    const url = route("admin.users.toggle", { user: id });

    axios.patch(url)
      .then(() => {
        router.reload({ only: ['users'] });
        toast.success("User status updated successfully!");
      })
      .catch(error => {
        console.error("Error toggling user status:", error);
        toast.error("Failed to update user status.");
      });
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Users</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add User
          </button>
        </div>

        {/* Users Table */}
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">#</th>
              <th className="p-2">Image</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Desktop Only</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">
                  {user.image_url ? (
                    <img
                      src={user.image_url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2 capitalize">{user.role}</td>
                <td className="p-2">
                  <label className="relative inline-flex items-center cursor-pointer" title="Restrict to Desktop Punch-in">
                    <input
                      type="checkbox"
                      checked={user.desktop_only}
                      onChange={() => handleDesktopToggle(user.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                    <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition peer-checked:translate-x-5"></span>
                  </label>
                </td>
                <td className="p-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.is_active}
                      onChange={() => handleToggle(user.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                    <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition peer-checked:translate-x-5"></span>
                  </label>
                </td>
                <td className="p-2 space-x-3">
                  {/* Edit button */}
                  <button
                    onClick={() => openModal(user)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => confirmDelete(user.id)}
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

        {/* Create/Edit Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white w-full max-w-lg p-6 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-4">
                {editingUser ? "Edit User" : "Add User"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full border px-3 py-2 rounded ${errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={!!editingUser}
                    className={`w-full border px-3 py-2 rounded ${errors.email ? "border-red-500" : "border-gray-300"
                      } ${editingUser ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full border px-3 py-2 rounded ${errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                    placeholder={editingUser ? "Leave blank to keep current" : ""}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block">Confirm Password</label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    className={`w-full border px-3 py-2 rounded ${errors.password_confirmation
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                  />
                  {errors.password_confirmation && (
                    <p className="text-red-500 text-sm">
                      {errors.password_confirmation}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded border-gray-300"
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {/* Desktop Only Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="desktop_only"
                    id="desktop_only"
                    checked={!!form.desktop_only}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="desktop_only" className="ml-2 block text-sm text-gray-900">
                    Desktop Punch-in Only
                  </label>
                </div>

                {/* Image */}
                <div>
                  <label className="block">Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded"
                  />

                  {editingUser && editingUser.image_url && (
                    <img
                      src={editingUser.image_url}
                      alt="Preview"
                      className="w-16 h-16 mt-2 rounded-full object-cover border"
                    />
                  )}
                </div>


                {/* Buttons */}
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
                    {editingUser ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {deleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
              <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
              <p className="mb-4">Are you sure you want to delete this user?</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
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
