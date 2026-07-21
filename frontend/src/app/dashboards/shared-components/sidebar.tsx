'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  KeyRound,
  LayoutDashboard,
  LogOut,
  Car,
  Wrench,
  FileText,
  Users,
  Briefcase,
  Calendar,
  CheckSquare,
  UserCircle,
  Store,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { FleetProLogo } from '@/components/branding/fleetpro-logo';
import { logoutApi } from '@/lib/api/auth';
import { adminNavigationSections } from '@/lib/admin-navigation';
import { AUTH_ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

const dashboardHrefByRole: Record<string, string> = {
  ADMIN: "/dashboards/admin",
  APPROVER: "/dashboards/approver",
  DRIVER: "/dashboards/driver",
  SYSTEM_USER: "/dashboards/staff",
};

const workspaceLabelByRole: Record<string, string> = {
  ADMIN: "Administrative Workspace",
  APPROVER: "Approver Workspace",
  SYSTEM_USER: "Staff Workspace",
  DRIVER: "Driver Workspace",
};

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [manuallyToggled, setManuallyToggled] = useState<Record<string, boolean>>({});

  const navSections = getNavSectionsByRole(user?.role);
  const fallbackHref = user?.role ? (dashboardHrefByRole[user.role] ?? '/') : '/';

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

  const isNavItemActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split('?');

    if (href === '/drivers') {
      return (
        pathname === href ||
        (pathname.startsWith('/drivers/') &&
          !pathname.startsWith('/drivers/leave-requests') &&
          !pathname.startsWith('/drivers/infractions'))
      );
    }

    if (hrefQuery) {
      return pathname === hrefPath && searchParams.toString() === hrefQuery;
    }

    if (pathname === hrefPath) {
      return searchParams.toString() === '';
    }

    return hrefPath !== fallbackHref && pathname.startsWith(hrefPath + '/');
  };

  const toggleExpanded = (href: string, currentlyOpen: boolean) => {
    setManuallyToggled((prev) => ({ ...prev, [href]: !currentlyOpen }));
  };

  return (
    <aside className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href={fallbackHref} className="space-y-3">
          <FleetProLogo theme="dark" size="sm" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              {user?.role ? (workspaceLabelByRole[user.role] ?? 'Workspace') : 'Workspace'}
            </p>
          </div>
        </Link>
      </div>

      <div className="sidebar-nav flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h2 className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {section.title}
              </h2>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isNavItemActive(item.href);
                  const hasChildren = !!item.children && item.children.length > 0;
                  const childActive = hasChildren
                    ? item.children!.some((child) => isNavItemActive(child.href))
                    : false;
                  const routeWantsOpen = isActive || childActive;
                  const isOpen = manuallyToggled[item.href] ?? routeWantsOpen;

                  if (!hasChildren) {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          'group flex items-center gap-2.5 rounded-2xl border px-2.5 py-2.5 text-[13px] font-semibold transition-all',
                          isActive
                            ? 'border-transparent bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                            : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-xl border transition-colors',
                            isActive
                              ? 'border-slate-950/10 bg-slate-950/10 text-slate-950'
                              : 'border-white/5 bg-white/5 text-slate-500 group-hover:border-white/10 group-hover:bg-slate-800 group-hover:text-amber-300'
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                        </span>
                        {item.label}
                      </Link>
                    );
                  }

                  return (
                    <div key={item.href} className="space-y-1">
                      <div
                        className={cn(
                          'group flex items-center gap-2.5 rounded-2xl border px-2.5 py-2.5 text-[13px] font-semibold transition-all',
                          isActive
                            ? 'border-transparent bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                            : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className="flex flex-1 items-center gap-2.5"
                        >
                          <span
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-xl border transition-colors',
                              isActive
                                ? 'border-slate-950/10 bg-slate-950/10 text-slate-950'
                                : 'border-white/5 bg-white/5 text-slate-500 group-hover:border-white/10 group-hover:bg-slate-800 group-hover:text-amber-300'
                            )}
                          >
                            <item.icon className="h-3.5 w-3.5" />
                          </span>
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.href, isOpen)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-current transition-transform hover:bg-black/5"
                          aria-label={isOpen ? 'Collapse' : 'Expand'}
                        >
                          <ChevronDown
                            className={cn('h-3.5 w-3.5 transition-transform', isOpen ? 'rotate-180' : '')}
                          />
                        </button>
                      </div>

                      {isOpen && (
                        <div className="ml-4 space-y-1 border-l border-white/10 pl-3">
                          {item.children!.map((child) => {
                            const isChildActive = isNavItemActive(child.href);
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onNavigate}
                                className={cn(
                                  'group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-[12.5px] font-semibold transition-all',
                                  isChildActive
                                    ? 'border-transparent bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                                    : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white'
                                )}
                              >
                                <span
                                  className={cn(
                                    'flex h-6 w-6 items-center justify-center rounded-lg border transition-colors',
                                    isChildActive
                                      ? 'border-slate-950/10 bg-slate-950/10 text-slate-950'
                                      : 'border-white/5 bg-white/5 text-slate-500 group-hover:border-white/10 group-hover:bg-slate-800 group-hover:text-amber-300'
                                  )}
                                >
                                  <child.icon className="h-3 w-3" />
                                </span>
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
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

function getNavSectionsByRole(role?: string) {
  if (role === 'ADMIN') {
    return adminNavigationSections;
  }

  const sections = [];
  const baseHref = role ? dashboardHrefByRole[role] ?? '/' : '/';

  // Everyone gets an Overview section
  sections.push({
    title: "Overview",
    items: [
      {
        label: 'Dashboard',
        href: baseHref,
        icon: LayoutDashboard,
      },
    ]
  });

  if (role === 'DRIVER') {
    sections.push({
      title: "My Profile",
      items: [
        { label: 'Profile', href: '/dashboards/driver/profile', icon: UserCircle },
        { label: 'Leave Request', href: '/dashboards/driver/leave-requests', icon: Calendar },
      ]
    });
    sections.push({
      title: "Trips",
      items: [
        { label: 'My Trips', href: '/dashboards/driver/trips', icon: Briefcase },
      ]
    });
  }
  if (role === 'APPROVER') {
    sections.push({
      title: "Approvals",
      items: [
        { label: 'Trip Requests', href: '/trips', icon: CheckSquare },
      ]
    });
    sections.push({
      title: "Drivers",
      items: [
        { label: 'Drivers', href: '/drivers', icon: Users },
        { label: 'Leave Requests', href: '/drivers/leave-requests', icon: Calendar },
        { label: 'Infractions', href: '/drivers/infractions', icon: AlertTriangle },
      ]
    });
    sections.push({
      title: "Fleet Review",
      items: [
        { label: 'Pending Maintenance Approvals', href: '/dashboards/fleet/maintenance?status=SUBMITTED', icon: CheckSquare },
        { label: 'All Maintenance Requests', href: '/dashboards/fleet/maintenance', icon: Wrench },
        { label: 'Vehicle Registry', href: '/dashboards/fleet/vehicles', icon: Car },
        { label: 'Vehicle Rentals', href: '/dashboards/fleet/rentals', icon: FileText },
      ]
    });
  }

  if (role === 'SYSTEM_USER' || role === 'STAFF') {
    sections.push({
      title: "Self Service",
      items: [
        { label: 'Request Trip', href: '/trips/create', icon: Briefcase },
        { label: 'My Trips', href: '/trips/requester', icon: Briefcase },
      ]
    });
    sections.push({
      title: "Fleet Management",
      items: [
        { label: 'Vehicle Registry', href: '/dashboards/fleet/vehicles', icon: Car },
        { label: 'Maintenance Requests', href: '/dashboards/fleet/maintenance', icon: Wrench },
        { label: 'Vehicle Rentals', href: '/dashboards/fleet/rentals', icon: FileText },
        { label: 'Vendors', href: '/dashboards/fleet/vendors', icon: Store },
      ]
    });
    sections.push({
      title: "My Profile",
      items: [
        { label: 'Profile', href: '/dashboards/staff/profile', icon: UserCircle },
      ]
    });
  }

  return sections;
}