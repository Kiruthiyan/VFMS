"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Calendar, Map, Truck, Users } from "lucide-react";

const driverMenu = [
  { label: "Driver Home", href: "/dashboard/driver", icon: Calendar },
  { label: "Maintenance", href: "/dashboard/driver/maintenance", icon: Truck },
  { label: "Rentals", href: "/dashboard/driver/rentals", icon: Calendar },
  { label: "Trip", href: "/dashboard/driver/trip", icon: Map },
  { label: "Driver & Staff", href: "/dashboard/driver/driver-and-staff", icon: Users },
];

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar title="Driver" menuItems={driverMenu} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 min-h-[72vh]">
          {children}
        </div>
      </main>
    </div>
  );
}
