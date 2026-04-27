"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-800">
          VFMS
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard/admin"
            className={`block px-4 py-2 rounded-md transition-colors ${
              pathname.startsWith("/dashboard/admin") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            Admin Panel
          </Link>
          <Link
            href="/dashboard/approver"
            className={`block px-4 py-2 rounded-md transition-colors ${
              pathname.startsWith("/dashboard/approver") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            Approver Portal
          </Link>
          <Link
            href="/dashboard/driver"
            className={`block px-4 py-2 rounded-md transition-colors ${
              pathname.startsWith("/dashboard/driver") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            Driver Portal
          </Link>
          <Link
            href="/dashboard/user"
            className={`block px-4 py-2 rounded-md transition-colors ${
              pathname.startsWith("/dashboard/user") ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            User Portal
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
