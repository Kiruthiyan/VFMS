'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  CheckSquare 
} from 'lucide-react';
import { toast } from 'sonner';

import { FleetProLogo } from '@/components/branding/fleetpro-logo';
import { logoutApi } from '@/lib/api/auth';
import { adminNavigationSections } from '@/lib/admin-navigation';
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

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

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

  return (
    <aside className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href={fallbackHref} className="space-y-3">
          <FleetProLogo theme="dark" size="sm" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Role workspace
            </p>
            <p className="text-sm leading-6 text-slate-300">
              Clean access for daily FleetPro tasks and account controls.
            </p>
          </div>
        </Link>
      </div>

      <div className="sidebar-scrollbar-hidden flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h2 className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {section.title}
              </h2>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  // Precise active state logic
                  const isActive = pathname === item.href || (item.href !== fallbackHref && pathname.startsWith(item.href + '/'));
                  
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
      title: "Trips & Fleet",
      items: [
        { label: 'My Trips', href: '/trips/driver', icon: Briefcase },
        { label: 'Trip Calendar', href: '/trips/calendar', icon: Calendar },
        { label: 'My Vehicle', href: '/drivers/assignment-readiness', icon: Car },
      ]
    });
    sections.push({
      title: "Self Service",
      items: [
        { label: 'Leave Requests', href: '/drivers/leave-requests', icon: Calendar },
        { label: 'Maintenance', href: '/dashboards/fleet/maintenance', icon: Wrench },
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
      title: "Fleet Management",
      items: [
        { label: 'Vehicles', href: '/dashboards/fleet/vehicles', icon: Car },
        { label: 'Maintenance', href: '/dashboards/fleet/maintenance', icon: Wrench },
        { label: 'Rentals', href: '/dashboards/fleet/rentals', icon: FileText },
        { label: 'Vendors', href: '/dashboards/fleet/vendors', icon: Users },
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
        { label: 'Vehicles', href: '/dashboards/fleet/vehicles', icon: Car },
        { label: 'Maintenance', href: '/dashboards/fleet/maintenance', icon: Wrench },
        { label: 'Rentals', href: '/dashboards/fleet/rentals', icon: FileText },
        { label: 'Vendors', href: '/dashboards/fleet/vendors', icon: Users },
      ]
    });
  }

  return sections;
}
