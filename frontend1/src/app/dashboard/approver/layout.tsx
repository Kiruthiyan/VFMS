"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Calendar, Map, Truck, Users } from "lucide-react";

const approverMenu = [
  { label: "Approver Home", href: "/dashboard/approver", icon: Calendar },
  { label: "Maintenance", href: "/dashboard/approver/maintenance", icon: Truck },
  { label: "Rentals", href: "/dashboard/approver/rentals", icon: Calendar },
  { label: "Trip", href: "/dashboard/approver/trip", icon: Map },
  { label: "Driver & Staff", href: "/dashboard/approver/driver-and-staff", icon: Users },
];

export default function ApproverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar title="Approver" menuItems={approverMenu} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 min-h-[72vh]">
          {children}
        </div>
      </main>
    </div>
  );
}
