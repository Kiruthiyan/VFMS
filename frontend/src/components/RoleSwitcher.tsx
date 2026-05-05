"use client";

import { useRole, Role } from "@/lib/role-context";

const ROLES: { value: Role; label: string; active: string }[] = [
  {
    value: "ADMIN",
    label: "Admin",
    active: "bg-blue-950 text-white shadow-md",
  },
  {
    value: "SYSTEM_USER",
    label: "System User",
    active: "bg-slate-600 text-white shadow-md",
  },
  {
    value: "APPROVER",
    label: "Approver",
    active: "bg-emerald-700 text-white shadow-md",
  },
  {
    value: "DRIVER",
    label: "Driver",
    active: "bg-slate-400 text-white shadow-md",
  },
];

export function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 bg-white/95 backdrop-blur-sm border-b border-slate-200 py-2 px-4 shadow-sm">
      <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">
        Demo Mode — Viewing as:
      </span>
      <div className="flex gap-1">
        {ROLES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRole(r.value)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
              role === r.value
                ? r.active
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
