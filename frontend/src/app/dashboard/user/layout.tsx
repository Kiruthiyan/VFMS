"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Calendar, Map, Truck } from "lucide-react";

const userMenu = [
  { label: "User Home", href: "/dashboard/user", icon: Calendar },
  { label: "Maintenance", href: "/dashboard/user/maintenance", icon: Truck },
  { label: "Rentals", href: "/dashboard/user/rentals", icon: Calendar },
  { label: "Trip", href: "/dashboard/user/trip", icon: Map },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar title="User" menuItems={userMenu} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/50 min-h-[72vh]">
          {children}
        </div>
      </main>
    </div>
  );
}
