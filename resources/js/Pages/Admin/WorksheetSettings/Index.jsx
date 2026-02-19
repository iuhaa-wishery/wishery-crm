import React from "react";
import { useForm, Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import toast from "react-hot-toast";

export default function Index({ user, settings }) {
    const { data, setData, post, processing, errors } = useForm({
        client_name_enabled: settings?.client_name_enabled ?? false,
        task_type_enabled: settings?.task_type_enabled ?? false,
        status_enabled: settings?.status_enabled ?? false,
        file_name_enabled: settings?.file_name_enabled ?? false,
        drive_link_enabled: settings?.drive_link_enabled ?? false,
        project_enabled: settings?.project_enabled ?? false,
        task_type_options: settings?.task_type_options ?? "DONE,NOT DONE,IN PROGRESS",
        task_type_freetext: settings?.task_type_freetext ?? false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.users.worksheet-settings.update", user.id), {
            onSuccess: () => toast.success("Settings updated successfully"),
        });
    };

    return (
        <AdminLayout title={`Worksheet Settings - ${user.name}`}>
            <Head title={`Worksheet Settings - ${user.name}`} />

            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Worksheet Settings</h1>
                    <p className="text-gray-500 mt-1">Select which fields should be visible for {user.name}'s daily worksheet.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { name: "client_name_enabled", label: "Client Name" },
                            { name: "task_type_enabled", label: "Task Type" },
                            { name: "status_enabled", label: "Status" },
                            { name: "file_name_enabled", label: "File Name" },
                            { name: "drive_link_enabled", label: "Drive Link" },
                            { name: "project_enabled", label: "Project" },
                            { name: "task_type_freetext", label: "Task Type Free Text" },
                        ].map((field) => (
                            <div key={field.name} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setData(field.name, !data[field.name])}>
                                <input
                                    type="checkbox"
                                    id={field.name}
                                    checked={data[field.name]}
                                    onChange={() => { }} // Handled by div click for better UX
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={field.name} className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                                    {field.label}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t font-bold">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Task Type Options (Comma Separated)
                        </label>
                        <textarea
                            value={data.task_type_options}
                            onChange={(e) => setData("task_type_options", e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px] p-3 border"
                            placeholder="e.g. POSTER, REEL, STORY, CAROUSEL"
                        />
                        <p className="mt-2 text-xs text-gray-500 italic">
                            Enter the options that will appear in the Task Type dropdown for this user.
                        </p>
                        {errors.task_type_options && (
                            <p className="text-red-500 text-sm mt-1">{errors.task_type_options}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                            {processing ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
