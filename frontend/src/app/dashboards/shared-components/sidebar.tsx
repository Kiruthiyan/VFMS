/**
 * Shared Sidebar Component for all dashboards
 * Used across all role-specific dashboards
 */
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { KeyRound, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';

import { logoutApi } from '@/lib/api/auth';
import { AUTH_ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const navItems = getNavItemsByRole(user?.role);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Clear local state even if backend logout fails.
    } finally {
      clearAuth();
      toast.success('Signed out successfully.');
      router.push(AUTH_ROUTES.LOGIN);
    }
  };

  return (
    <aside className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href={navItems[0]?.href ?? '/'} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              VFMS
            </p>
            <p className="text-base font-semibold text-white">Workspace</p>
          </div>
        </Link>
      </div>

      <div className="sidebar-scrollbar-hidden flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          <div>
            <h2 className="mb-3 px-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Navigation
            </h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group flex items-center gap-2.5 rounded-2xl border px-2.5 py-2.5 text-[13px] font-semibold transition-all',
                    pathname === item.href
                      ? 'border-transparent bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                      : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl border transition-colors',
                      pathname === item.href
                        ? 'border-slate-950/10 bg-slate-950/10 text-slate-950'
                        : 'border-white/5 bg-white/5 text-slate-500 group-hover:border-white/10 group-hover:bg-slate-800 group-hover:text-amber-300'
                    )}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-3.5">
        <Link
          href="/settings/change-password"
          onClick={onNavigate}
          className="mb-1.5 flex items-center gap-2.5 rounded-2xl px-2.5 py-2.5 text-[13px] font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
            <KeyRound className="h-3.5 w-3.5" />
          </span>
          Security Settings
        </Link>
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
    </aside>
  );
}

function getNavItemsByRole(role?: string) {
  const dashboardHrefByRole: Record<string, string> = {
    ADMIN: "/dashboards/admin",
    APPROVER: "/dashboards/approver",
    DRIVER: "/dashboards/driver",
    SYSTEM_USER: "/dashboards/staff",
  };

  return [
    {
      label: 'Dashboard',
      href: role ? dashboardHrefByRole[role] ?? '/' : '/',
      icon: LayoutDashboard,
    },
  ];
}
