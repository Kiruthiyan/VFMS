"use client";

import { Archive, LayoutDashboard, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const USER_MANAGEMENT_ITEMS = [
  {
    href: "/admin/users",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users/all",
    label: "All Users",
    icon: Users,
  },
  {
    href: "/admin/users/create",
    label: "Create User",
    icon: UserPlus,
  },
  {
    href: "/admin/users/deleted",
    label: "Archived",
    icon: Archive,
  },
];

export function UserManagementNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="User management sections"
      className="rounded-[28px] border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur"
    >
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {USER_MANAGEMENT_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-[20px] px-4 py-3 text-left transition-all duration-200",
                isActive
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                  : "bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-slate-950"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                  isActive
                    ? "border-white/10 bg-white/10 text-amber-300"
                    : "border-slate-200 bg-white text-slate-700"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p
                  className={cn(
                    "text-xs",
                    isActive ? "text-slate-300" : "text-slate-500"
                  )}
                >
                  {isActive ? "Current section" : "Open section"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
