"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { BarChart3, Calendar, Droplet, FileText, Map, Truck, Users, Wrench } from "lucide-react";

const adminMenu = [
  { label: "Dashboard Home", href: "/dashboard/admin", icon: BarChart3 },
  { label: "Maintenance", href: "/dashboard/admin/maintenance", icon: Wrench },
  { label: "Rentals", href: "/dashboard/admin/rentals", icon: Calendar },
  { label: "Trip", href: "/dashboard/admin/trip", icon: Map },
  { label: "Driver & Staff", href: "/dashboard/admin/driver-and-staff", icon: Users },
  { label: "Fuel Management", href: "/dashboard/admin/fuel-management", icon: Droplet },
  {
    label: "Reports",
    href: "/dashboard/admin/reports",
    icon: BarChart3,
    children: [
      { label: "Reports Home", href: "/dashboard/admin/reports", icon: FileText },
      { label: "Maintenance Reports", href: "/dashboard/admin/reports/maintenance", icon: Wrench },
      { label: "Fuel Reports", href: "/dashboard/admin/reports/fuel", icon: Droplet },
      { label: "Fleet Utilization", href: "/dashboard/admin/reports/utilization", icon: Truck },
      { label: "Driver Reports", href: "/dashboard/admin/reports/drivers", icon: Users },
      { label: "Rental Reports", href: "/dashboard/admin/reports/rentals", icon: Calendar },
      { label: "Export Reports", href: "/dashboard/admin/reports/export", icon: FileText },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar title="Admin" menuItems={adminMenu} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 min-h-[72vh]">
          {children}
        </div>
      </main>
    </div>
  );
}
