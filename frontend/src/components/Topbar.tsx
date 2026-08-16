"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRole, Role } from "@/lib/role-context";
import { Bell, ChevronDown, Menu, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const DEMO_ROLE_ENABLED =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_ENABLE_DEMO_ROLE === "true";

// Build readable breadcrumb from pathname
function getBreadcrumb(pathname: string): string {
  const segments = pathname
    .replace("/dashboards", "")
    .split("/")
    .filter(Boolean);
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

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, currentUser } = useRole();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const breadcrumb = getBreadcrumb(pathname);
  
  // Dynamically calculate initials from actual data
  const initials = currentUser?.name
    ? currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "G";

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/90 px-3 backdrop-blur-md shadow-sm sm:px-6 lg:left-64 xl:left-[17rem]">
      {/* Mobile Menu Toggle */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open dashboard menu"
        className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Breadcrumb */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="hidden h-6 w-1 shrink-0 rounded-full bg-amber-400 sm:block" />
        <h1 className="min-w-0 truncate text-base font-bold text-slate-900 sm:text-lg">{breadcrumb}</h1>
      </div>

      {/* Right section */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* Notification */}
        <button className="relative h-9 w-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="hidden h-6 w-px bg-slate-200 sm:block" />

        {/* Role badge (demo switcher only when explicitly enabled) */}
        <div className="relative hidden sm:block">
          {DEMO_ROLE_ENABLED ? (
            <>
              <button
                onClick={() => setShowRolePicker((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadgeColors[role]}`}>
                  {ROLES.find((r) => r.value === role)?.label}
                </span>
                <span className="hidden text-[10px] text-slate-400 sm:block">
                  Demo Role
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {showRolePicker && (
                <div className="absolute right-0 top-11 w-44 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1">
                    Switch Role
                  </p>
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => {
                        setRole(r.value);
                        setShowRolePicker(false);
                      }}
                      className={`w-full text-left text-sm px-3 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                        role === r.value
                          ? "text-blue-700 font-semibold bg-blue-50"
                          : "text-slate-700"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${role === r.value ? "bg-blue-500" : "bg-slate-200"}`} />
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadgeColors[role]}`}>
              {ROLES.find((r) => r.value === role)?.label}
            </span>
          )}
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 rounded-full hover:bg-slate-50 p-1 pr-2 sm:pr-3 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            {/* Dynamic Avatar based on actual user name */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
              {initials}
            </div>
            
            <div className="hidden flex-col items-start sm:flex">
              <span className="text-sm font-semibold text-slate-900 leading-none">
                {currentUser?.name || "Guest User"}
              </span>
              <span className="text-xs text-slate-500 mt-1 sm:hidden">
                {ROLES.find((r) => r.value === role)?.label}
              </span>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <DropdownMenuLabel className="px-3 py-2.5">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-900">{currentUser?.name || "Guest User"}</span>
                <span className="text-xs text-slate-500">{ROLES.find((r) => r.value === role)?.label}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={() => router.push('/settings/change-password')}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors focus:bg-slate-50 focus:text-slate-900"
            >
              <Settings className="h-4 w-4" />
              <span>Security Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors focus:bg-rose-50 focus:text-rose-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
