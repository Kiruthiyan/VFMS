"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Shield, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { logoutApi } from "@/lib/api/auth";
import {
  adminNavigationSections,
  getAdminBreadcrumbs,
  getAdminPageTitle,
  isAdminNavItemActive,
} from "@/lib/admin-navigation";
import { AUTH_ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/useUser";
import { useAuthStore } from "@/store/auth-store";

interface AdminShellProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pageTitle = useMemo(() => getAdminPageTitle(pathname), [pathname]);
  const breadcrumbs = useMemo(
    () => getAdminBreadcrumbs(pathname),
    [pathname]
  );

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
      <div className="border-b border-slate-800 px-6 py-5">
        <Link href="/dashboards/admin" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              VFMS
            </p>
            <h1 className="text-lg font-semibold text-white">
              Admin Panel
            </h1>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-6">
          {adminNavigationSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
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
                        "group flex items-start gap-3 rounded-2xl border border-transparent px-3 py-3 transition-all duration-200",
                        active
                          ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                          : "text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                          active
                            ? "bg-slate-950/10 text-slate-950"
                            : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-amber-300"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {item.label}
                        </span>
                        {item.description && (
                          <span
                            className={cn(
                              "mt-0.5 block text-xs",
                              active ? "text-slate-900/75" : "text-slate-500"
                            )}
                          >
                            {item.description}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800">
            <LogOut className="h-4 w-4" />
          </span>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-950">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-slate-800 bg-slate-950 lg:block">
        {SidebarContent}
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950 transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-end border-b border-slate-800 px-4 py-3">
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

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={`${crumb}-${index}`} className="flex items-center gap-2">
                      {index > 0 && <span className="text-slate-300">/</span>}
                      <span>{crumb}</span>
                    </span>
                  ))}
                </div>
                <h2 className="truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                  {pageTitle}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-400" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition-colors hover:bg-slate-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-amber-300">
                    {user?.name?.slice(0, 1) ?? "A"}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="max-w-[160px] truncate text-sm font-semibold text-slate-950">
                      {user?.name ?? "Admin"}
                    </p>
                    <p className="max-w-[160px] truncate text-xs text-slate-500">
                      {user?.email ?? "admin@vfms.local"}
                    </p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
                </button>

                {profileOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10">
                      <div className="rounded-xl px-3 py-3">
                        <p className="text-sm font-semibold text-slate-950">
                          {user?.name ?? "Administrator"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {user?.email ?? "admin@vfms.local"}
                        </p>
                      </div>
                      <div className="my-2 h-px bg-slate-100" />
                      <Link
                        href="/settings/change-password"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                      >
                        <Shield className="h-4 w-4" />
                        Change Password
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
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
