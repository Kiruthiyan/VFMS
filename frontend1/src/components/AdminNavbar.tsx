"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", path: "/dashboard/admin" },
  { name: "Maintenance", path: "/dashboard/admin/maintenance" },
  { name: "Rentals", path: "/dashboard/admin/rentals" },
  { name: "Trip", path: "/dashboard/admin/trip" },
  { name: "Driver & Staff", path: "/dashboard/admin/driver-and-staff" },
  { name: "Fuel Management", path: "/dashboard/admin/fuel-management" },
  { name: "Reports", path: "/dashboard/admin/reports" },
];

export default function AdminNavbar() {
  const pathname = usePathname();

  // If we are at the root admin dashboard, or exactly matching the path
  const isActive = (path: string) => {
    if (path === "/dashboard/admin") {
      return pathname === "/dashboard/admin";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-3">
      <div className="flex space-x-2 overflow-x-auto">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`whitespace-nowrap px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
