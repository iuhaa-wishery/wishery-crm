import React, { useState, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import UserLayout from "@/Layouts/UserLayout";

export default function UserLeaves() {
  const { props } = usePage();
  const initialLeaves = props.leaves || [];

  const [leaves, setLeaves] = useState(initialLeaves);
  const [isOpen, setIsOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [form, setForm] = useState({
    leave_type: "",
    from_date: "",
    to_date: "",
    reason: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLeaves(props.leaves || []);
  }, [props.leaves]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((e2) => ({ ...e2, [e.target.name]: undefined }));
  };

  const validateForm = () => {
    let temp = {};

    if (!form.leave_type) temp.leave_type = "Leave type is required";
    if (!form.from_date) temp.from_date = "Start date is required";
    if (!form.to_date) temp.to_date = "End date is required";

    if (
      form.from_date &&
      form.to_date &&
      new Date(form.to_date) < new Date(form.from_date)
    ) {
      temp.to_date = "End date cannot be before start date";
    }

    if (!form.reason) temp.reason = "Reason is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    router.post(
      route("leave.store"),
      form,
      {
        onSuccess: () => {
          setIsOpen(false);
          setForm({ leave_type: "", from_date: "", to_date: "", reason: "" });
        },
        onError: (errs) => {
          setErrors(errs);
        },
      }
    );
  };

  const openView = (leave) => {
    setSelectedLeave(leave);
    setViewOpen(true);
  };

  return (
    <UserLayout title="Leave Applications">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Leave Applications</h2>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Apply Leave
          </button>
        </div>

        {/* Leave List */}
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">#</th>
              <th className="p-2">Type</th>
              <th className="p-2">Dates</th>
              <th className="p-2">Days</th>
              <th className="p-2">Reason</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No leave records found.
                </td>
              </tr>
            ) : (
              leaves.map((item, index) => {
                const s = new Date(item.from_date);
                const e = new Date(item.to_date);
                const days = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <tr key={item.id} className="border-t">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2 capitalize">{item.leave_type}</td>
                    <td className="p-2">
                      {new Date(item.from_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} - {new Date(item.to_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-2">{days} d</td>
                    <td className="p-2 max-w-xs truncate" title={item.reason}>
                      {item.reason || "-"}
                    </td>
                    <td className="p-2 capitalize">
                      <span
                        className={`px-2 py-1 rounded text-xs text-white ${item.status === "pending"
                            ? "bg-yellow-500"
                            : item.status === "approved"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => openView(item)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* APPLY LEAVE POPUP */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white w-[500px] p-6 rounded shadow-lg">
              <h3 className="text-lg font-bold mb-4">Apply Leave</h3>

              <form onSubmit={handleSubmit} className="space-y-3">

                <div>
                  <label>Leave Type *</label>
                  <select
                    name="leave_type"
                    value={form.leave_type}
                    onChange={handleChange}
                    className="w-full border p-2 rounded mt-1"
                  >
                    <option value="">--Select--</option>
                    <option value="casual">Casual</option>
                    <option value="sick">Sick</option>
                    <option value="paid">Paid</option>
                  </select>
                  {errors.leave_type && (
                    <p className="text-red-600 text-sm">{errors.leave_type}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label>From Date *</label>
                    <input
                      type="date"
                      name="from_date"
                      value={form.from_date}
                      onChange={handleChange}
                      className="w-full border p-2 rounded mt-1"
                    />
                    {errors.from_date && (
                      <p className="text-red-600 text-sm">{errors.from_date}</p>
                    )}
                  </div>

                  <div>
                    <label>To Date *</label>
                    <input
                      type="date"
                      name="to_date"
                      value={form.to_date}
                      onChange={handleChange}
                      className="w-full border p-2 rounded mt-1"
                    />
                    {errors.to_date && (
                      <p className="text-red-600 text-sm">{errors.to_date}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label>Reason *</label>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border p-2 rounded mt-1"
                  ></textarea>
                  {errors.reason && (
                    <p className="text-red-600 text-sm">{errors.reason}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW POPUP */}
        {viewOpen && selectedLeave && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white w-[500px] p-6 rounded shadow-lg">
              <h3 className="text-lg font-bold mb-4">Leave Details</h3>

              <p><b>Type:</b> {selectedLeave.leave_type}</p>
              <p><b>From:</b> {selectedLeave.from_date}</p>
              <p><b>To:</b> {selectedLeave.to_date}</p>
              <p><b>Status:</b> {selectedLeave.status}</p>
              <p><b>Reason:</b> {selectedLeave.reason}</p>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setViewOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
