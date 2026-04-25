"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRole } from "@/lib/role-context";
import { Suspense } from "react";
import {
  LayoutDashboard,
  Car,
  Wrench,
  TruckIcon,
  Fuel,
  Users,
  CalendarClock,
  BarChart3,
  UserCog,
  Settings,
  ChevronDown,
  ChevronRight,
  Lock,
  Building2,
} from "lucide-react";
import { useState } from "react";

interface SubItem {
  label: string;
  href: string;
  roles?: string[];
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  locked?: boolean;
  children?: SubItem[];
}

export function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarInner />
    </Suspense>
  );
}

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role, canCreate, canApprove, canAdmin } = useRole();
  const [expanded, setExpanded] = useState<string[]>([
    "Maintenance",
    "Rentals",
  ]);

  // Full URL including query string for exact active matching
  const fullUrl = `${pathname}${searchParams.toString() ? "?" + searchParams.toString() : ""}`;

  const isChildActive = (href: string) => {
    if (href.includes("?")) {
      // Query-param link: must match full URL exactly
      return fullUrl === href;
    }
    // Plain path link: only active when pathname matches AND no query params present
    // (if query params are present, a sibling query-param link should be active instead)
    return pathname === href && searchParams.toString() === "";
  };

  const toggle = (label: string) =>
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      href: "/dashboard",
    },
    {
      label: "Vehicles",
      icon: <Car className="h-4 w-4" />,
      children: [
        { label: "All Vehicles", href: "/dashboard/vehicles" },
        ...(canAdmin
          ? [{ label: "Add Vehicle", href: "/dashboard/vehicles/add" }]
          : []),
      ],
    },
    {
      label: "Maintenance",
      icon: <Wrench className="h-4 w-4" />,
      children: [
        { label: "All Requests", href: "/dashboard/maintenance" },
        ...(canCreate
          ? [{ label: "Create Request", href: "/dashboard/maintenance/create" }]
          : []),
        ...(canApprove
          ? [
              {
                label: "Pending Approvals",
                href: "/dashboard/maintenance?status=SUBMITTED",
              },
            ]
          : []),
      ],
    },
    {
      label: "Rentals",
      icon: <TruckIcon className="h-4 w-4" />,
      children: [
        { label: "All Rentals", href: "/dashboard/rentals" },
        ...(canCreate
          ? [{ label: "New Rental", href: "/dashboard/rentals/create" }]
          : []),
        ...(canCreate
          ? [{ label: "Vendors", href: "/dashboard/vendors" }]
          : []),
      ],
    },
    {
      label: "Fuel Management",
      icon: <Fuel className="h-4 w-4" />,
      locked: true,
    },
    {
      label: "Drivers & Staff",
      icon: <Users className="h-4 w-4" />,
      locked: true,
    },
    {
      label: "Trip Scheduling",
      icon: <CalendarClock className="h-4 w-4" />,
      locked: true,
    },
    {
      label: "Reports & Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      locked: true,
    },
    {
      label: "User Management",
      icon: <UserCog className="h-4 w-4" />,
      locked: true,
    },
    { label: "Settings", icon: <Settings className="h-4 w-4" />, locked: true },
  ];

  const roleColors: Record<string, string> = {
    ADMIN: "bg-blue-500 text-white",
    SYSTEM_USER: "bg-slate-500 text-white",
    APPROVER: "bg-emerald-600 text-white",
    DRIVER: "bg-amber-500 text-white",
  };

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrator",
    SYSTEM_USER: "System User",
    APPROVER: "Approver",
    DRIVER: "Driver",
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0f172a] flex flex-col z-40 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="h-9 w-9 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg">
          <TruckIcon className="h-5 w-5 text-blue-950" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">
            FleetPro
          </p>
          <p className="text-slate-400 text-[10px] tracking-wide">
            Fleet Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = item.href ? pathname === item.href : false;
          const isExpanded = expanded.includes(item.label);
          const hasActiveChild = item.children?.some((c) =>
            isChildActive(c.href),
          );

          if (item.locked) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-not-allowed opacity-40 select-none"
              >
                <span className="text-slate-400">{item.icon}</span>
                <span className="text-slate-400 text-sm flex-1">
                  {item.label}
                </span>
                <span className="text-[9px] font-semibold bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full tracking-wider">
                  SOON
                </span>
                <Lock className="h-3 w-3 text-slate-600" />
              </div>
            );
          }

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left ${
                    hasActiveChild
                      ? "bg-amber-400/10 text-amber-400 border-l-2 border-amber-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium flex-1">
                    {item.label}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                  )}
                </button>
                {isExpanded && (
                  <div className="relative ml-4 mt-1 space-y-0.5">
                    {/* Vertical connector line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
                    {item.children.map((child) => {
                      const childActive = isChildActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`relative flex items-center text-xs pl-4 pr-2 py-2 rounded-r-lg transition-all duration-150 ${
                            childActive
                              ? "text-amber-400 font-semibold bg-amber-400/5"
                              : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                          }`}
                        >
                          {/* Active segment replaces the grey line with amber */}
                          {childActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-5 bg-amber-400" />
                          )}
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-amber-400/10 text-amber-400 border-l-2 border-amber-400 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {role === "ADMIN"
              ? "AD"
              : role === "SYSTEM_USER"
                ? "SU"
                : role === "APPROVER"
                  ? "AP"
                  : "DR"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              FleetPro User
            </p>
            <span
              className={`inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleColors[role]}`}
            >
              {roleLabels[role]}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
