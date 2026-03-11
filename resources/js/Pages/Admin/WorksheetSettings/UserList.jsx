import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Settings, ChevronRight, ClipboardList, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function UserList({ users, designers_task_types }) {
    const { data, setData, post, processing } = useForm({
        designers_task_types: designers_task_types || "",
    });

    const handleGlobalSubmit = (e) => {
        e.preventDefault();
        post(route("admin.worksheet-settings.global.update"), {
            onSuccess: () => toast.success("Global settings updated"),
        });
    };

    return (
        <AdminLayout title="Worksheet Settings - Select User">
            <Head title="Worksheet Settings - Select User" />

            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Worksheet Configuration</h1>
                    <p className="text-gray-500">Select a user to configure their daily worksheet fields.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <li key={user.id} className="hover:bg-gray-50 transition-colors">
                                <Link
                                    href={route("admin.users.worksheet-settings", user.id)}
                                    className="flex items-center justify-between p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <span className="text-sm font-medium text-gray-500">Action</span>
                                        <ChevronRight size={18} />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Global Settings Section for Designers Worklist */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <ClipboardList size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Designers Worklist Settings</h2>
                            <p className="text-sm text-gray-500 font-medium">Configure global defaults for the designers module</p>
                        </div>
                    </div>

                    <form onSubmit={handleGlobalSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                Task Type Options (Comma Separated)
                            </label>
                            <textarea
                                value={data.designers_task_types}
                                onChange={(e) => setData("designers_task_types", e.target.value)}
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl p-4 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[120px]"
                                placeholder="e.g. POSTER, REEL, STORY, CAROUSEL, LOGO DESIGN"
                            />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight italic">
                                These options will appear in the "Task Type" dropdown when adding new tasks to the Designers Worklist.
                            </p>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-50">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 hover:shadow-blue-200 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save size={16} />
                                {processing ? "Saving..." : "Save Global Settings"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
