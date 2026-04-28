"use client";

import { useState, type ReactNode } from "react";

import { DashboardHeader } from "@/app/dashboards/shared-components/header";
import { DashboardSidebar } from "@/app/dashboards/shared-components/sidebar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DashboardShell({
  title,
  description,
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell-background min-h-screen text-slate-950">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 overflow-hidden bg-slate-900 xl:w-[17rem] lg:block">
        <DashboardSidebar />
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 overflow-hidden bg-slate-900 transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="lg:pl-64 xl:pl-[17rem]">
        <DashboardHeader
          title={title}
          description={description}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
