"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Droplet,
  FileText,
  LogOut,
  Map,
  Shield,
  Truck,
  Users,
  User,
  UserCheck,
  Key,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

export type SidebarMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: SidebarMenuItem[];
};

type SidebarProps = {
  title: string;
  menuItems: SidebarMenuItem[];
};

export function Sidebar({ title, menuItems }: SidebarProps) {
  const pathname = usePathname();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const activeKeys = useMemo(
    () =>
      menuItems
        .filter((item) => item.children?.some((child) => pathname?.startsWith(child.href)))
        .map((item) => item.label),
    [menuItems, pathname]
  );

  const toggleSection = (label: string) => {
    setOpenKeys((current) =>
      current.includes(label) ? current.filter((key) => key !== label) : [...current, label]
    );
  };

  const renderMenuItem = (item: SidebarMenuItem, depth = 0) => {
    const isActive =
      pathname === item.href || pathname?.startsWith(item.href + "/") || item.children?.some((child) => pathname?.startsWith(child.href));
    const isOpen = openKeys.includes(item.label) || activeKeys.includes(item.label);

    return (
      <div key={item.href}>
        <div className={cn("flex items-center justify-between rounded-lg px-3 py-2 transition-all", isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/80 hover:text-white")}> 
          <Link
            href={item.href}
            className={cn(
              "flex items-center gap-3 flex-1",
              depth > 0 ? "pl-8" : ""
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive ? "text-amber-400" : "text-slate-400 group-hover:text-amber-400")} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>

          {item.children?.length ? (
            <button
              type="button"
              onClick={() => toggleSection(item.label)}
              className={cn("ml-2 p-1 rounded-full transition-transform", isOpen ? "rotate-180" : "")}
              aria-label={isOpen ? "Collapse submenu" : "Expand submenu"}
            >
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          ) : null}
        </div>

        {item.children && isOpen ? (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => renderMenuItem(child, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <aside className="w-72 bg-slate-950 text-slate-200 min-h-screen border-r border-slate-800/80 shrink-0">
      <div className="h-20 flex items-center px-6 border-b border-slate-800/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 grid place-items-center shadow-lg shadow-amber-500/30">
            <BarChart3 className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{title}</p>
            <p className="text-lg font-semibold text-white">VFMS Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-4 custom-scrollbar">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      <div className="p-4 border-t border-slate-800/70">
        <button className="flex items-center gap-3 w-full rounded-2xl bg-slate-900/70 px-4 py-3 text-slate-300 hover:bg-slate-800/90 transition-colors">
          <LogOut className="h-5 w-5 text-rose-400" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
