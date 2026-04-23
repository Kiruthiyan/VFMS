"use client";

import { usePathname } from "next/navigation";
import { useRole, Role } from "@/lib/role-context";
import { Bell, ChevronDown } from "lucide-react";
import { useState } from "react";

const ROLES: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Administrator" },
  { value: "SYSTEM_USER", label: "System User" },
  { value: "APPROVER", label: "Approver" },
  { value: "DRIVER", label: "Driver" },
];

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-blue-100 text-blue-800",
  SYSTEM_USER: "bg-slate-100 text-slate-700",
  APPROVER: "bg-emerald-100 text-emerald-800",
  DRIVER: "bg-amber-100 text-amber-800",
};

// Build readable breadcrumb from pathname
function getBreadcrumb(pathname: string): string {
  const segments = pathname.replace("/dashboard", "").split("/").filter(Boolean);
  if (segments.length === 0) return "Dashboard Overview";
  return segments
    .map((s) => {
      if (/^\d+$/.test(s)) return "Details";
      if (s === "create") return "Create";
      if (s === "add") return "Add";
      if (s === "edit") return "Edit";
      return s.charAt(0).toUpperCase() + s.slice(1);
    })
    .join(" / ");
}

export function Topbar() {
  const pathname = usePathname();
  const { role, setRole } = useRole();
  const [showRolePicker, setShowRolePicker] = useState(false);

  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-6 z-30 shadow-sm">
      {/* Breadcrumb */}
      <div className="flex-1 flex items-center gap-3">
        <div className="w-1 h-6 bg-amber-400 rounded-full" />
        <h1 className="text-lg font-bold text-slate-900">{breadcrumb}</h1>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="relative h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200" />

        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRolePicker((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadgeColors[role]}`}>
              {ROLES.find((r) => r.value === role)?.label}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:block">Demo Role</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showRolePicker && (
            <div className="absolute right-0 top-10 w-44 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
                Switch Role
              </p>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => { setRole(r.value); setShowRolePicker(false); }}
                  className={`w-full text-left text-sm px-3 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                    role === r.value ? "text-blue-700 font-semibold bg-blue-50" : "text-slate-700"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${role === r.value ? "bg-blue-500" : "bg-slate-200"}`} />
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-xs shadow">
          {role === "ADMIN" ? "AD" : role === "SYSTEM_USER" ? "SU" : role === "APPROVER" ? "AP" : "DR"}
        </div>
      </div>
    </header>
  );
}
