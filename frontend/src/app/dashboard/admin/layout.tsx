"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { Sidebar } from "@/components/layout/Sidebar";
import { BarChart3, Calendar, Droplet, FileText, Map, ShieldCheck, Truck, UserPlus, Users, Wrench } from "lucide-react";

const adminMenu = [
  { label: "Dashboard Home", href: "/dashboards/admin", icon: BarChart3 },
  { label: "User Dashboard", href: "/admin/users", icon: Users },
  { label: "Create User", href: "/admin/users/create", icon: UserPlus },
  { label: "All Users", href: "/admin/users/all", icon: ShieldCheck },
  { label: "Maintenance", href: "/dashboard/admin/maintenance", icon: Wrench },
  { label: "Rentals", href: "/dashboard/admin/rentals", icon: Calendar },
  { label: "Trip", href: "/dashboard/admin/trip", icon: Map },
  { label: "Driver & Staff", href: "/dashboard/admin/driver-and-staff", icon: Users },
  { label: "Fuel Management", href: "/admin/fuel", icon: Droplet },
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
    <RoleGuard allowedRole="ADMIN">
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar title="Admin" menuItems={adminMenu} />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 min-h-[72vh]">
            {children}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
