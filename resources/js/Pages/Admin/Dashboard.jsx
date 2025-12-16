import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Dashboard() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Welcome to the admin dashboard</h3>
      <p className="mb-6">Quick stats and charts go here.</p>
    </div>
  );
}

Dashboard.layout = (page) => <AdminLayout>{page}</AdminLayout>;
