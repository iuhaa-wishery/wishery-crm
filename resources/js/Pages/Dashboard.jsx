import React from "react";
import { Head } from "@inertiajs/react";
import UserLayout from "@/Layouts/UserLayout";

export default function Dashboard() {
    return (
        <div>
            <Head title="User Dashboard" />
            <div className="bg-white p-6 rounded shadow mb-6">
                <h2 className="text-xl font-bold mb-4">Welcome to your Dashboard</h2>
                <p>Here you can see your profile and manage your tasks.</p>
            </div>
        </div>
    );
}

Dashboard.layout = (page) => <UserLayout title="Dashboard">{page}</UserLayout>;
