"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { FleetProLogo } from "@/components/branding/fleetpro-logo";
import { logoutApi } from "@/lib/api/auth";
import {
  adminNavigationSections,
  isAdminNavItemActive,
} from "@/lib/admin-navigation";
import { AUTH_ROUTES } from "@/lib/constants/routes";
import { ROLE_HOME } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface AdminShellProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AdminShell({ children, requireAdmin = false }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminRequired = requireAdmin || pathname.startsWith("/admin");

  useEffect(() => {
    if (!hydrated || !adminRequired || !user) {
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [adminRequired, hydrated, router, user]);

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
        <Link href="/dashboards/admin" className="space-y-3">
          <FleetProLogo theme="dark" size="sm" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Administrative workspace
            </p>
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
        <div className="px-4 pt-4 sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
