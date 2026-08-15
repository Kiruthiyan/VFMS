"use client";

import { Suspense, useState, type ReactNode } from "react";
import { Menu, Sparkles } from "lucide-react";

import { DashboardSidebar } from "@/app/dashboards/shared-components/sidebar";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  title?: string;
  description?: string;
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
        <Suspense fallback={null}>
          <DashboardSidebar />
        </Suspense>
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden bg-slate-900 transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Suspense fallback={null}>
          <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
        </Suspense>
      </aside>

      <div className="lg:pl-64 xl:pl-[17rem]">
        <div className="px-4 pt-4 sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open dashboard menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <main className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-screen-2xl space-y-5 sm:space-y-6">
            {title && (
              <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-[28px]">
                <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(148,163,184,0.14),_transparent_45%)]" />
                <div className="relative flex min-w-0 flex-col gap-4 p-4 sm:gap-5 sm:p-7">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    FleetPro Workspace
                  </div>
                  <div className="min-w-0 space-y-2">
                    <h1 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      {title}
                    </h1>
                    {description && (
                      <p className="max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
