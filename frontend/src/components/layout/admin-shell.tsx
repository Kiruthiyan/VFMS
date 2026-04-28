"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Shield, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { logoutApi } from "@/lib/api/auth";
import {
  adminNavigationSections,
  getAdminBreadcrumbs,
  isAdminNavItemActive,
} from "@/lib/admin-navigation";
import { AUTH_ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface AdminShellProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const breadcrumbs = getAdminBreadcrumbs(pathname).join(" / ");

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Clear the local session even if the backend logout call fails.
    } finally {
      clearAuth();
      toast.success("Signed out successfully.");
      router.push(AUTH_ROUTES.LOGIN);
    }
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/dashboards/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20">
            <Shield className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              VFMS
            </p>
            <h1 className="text-base font-semibold text-white">Admin Panel</h1>
          </div>
        </Link>
      </div>

      <div className="sidebar-scrollbar-hidden -mr-4 flex-1 overflow-y-auto px-4 py-5 pr-8">
        <div className="space-y-5">
          {adminNavigationSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <p className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isAdminNavItemActive(pathname, item);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-2xl border px-2.5 py-2.5 transition-all duration-200",
                        active
                          ? "border-transparent bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                          : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors",
                          active
                            ? "border-slate-950/10 bg-slate-950/10 text-slate-950"
                            : "border-white/5 bg-white/5 text-slate-500 group-hover:border-white/10 group-hover:bg-slate-800 group-hover:text-amber-300"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 text-[13px] font-semibold leading-5">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-3.5">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-left text-[13px] font-semibold text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800">
            <LogOut className="h-3.5 w-3.5" />
          </span>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-shell-background min-h-screen text-slate-950">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 overflow-hidden bg-slate-950 xl:w-[17rem] lg:block">
        {SidebarContent}
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 overflow-hidden bg-slate-950 transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-end border-b border-white/10 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {SidebarContent}
      </aside>

      <div className="lg:pl-64 xl:pl-[17rem]">
        <header className="app-topbar sticky top-0 z-30">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  {breadcrumbs}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                    Admin Workspace
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              <div className="app-surface-soft rounded-3xl px-4 py-2.5">
                <p className="text-sm font-bold text-slate-950">
                  {user?.fullName ?? "Administrator"}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {user?.role?.replace("_", " ") ?? "Admin"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
