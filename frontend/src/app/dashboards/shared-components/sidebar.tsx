/**
 * Shared Sidebar Component for all dashboards
 * Used across all role-specific dashboards
 */
'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';

export function DashboardSidebar() {
  const user = useAuthStore((state) => state.user);

  const navItems = getNavItemsByRole(user?.role);

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 h-screen sticky top-0">
      <div className="space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Navigation
          </h2>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-amber-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}

function getNavItemsByRole(role?: string) {
  const commonItems = [
    { label: 'Dashboard', href: `/dashboards/${role?.toLowerCase() || 'dashboard'}` },
    { label: 'Settings', href: '/settings/change-password' },
  ];

  const roleSpecificItems: Record<string, any[]> = {
    ADMIN: [
      { label: 'Users', href: '/dashboards/admin/users' },
      { label: 'Reports', href: '/dashboards/admin/reports' },
      { label: 'Settings', href: '/dashboards/admin/settings' },
    ],
    DRIVER: [
      { label: 'My Vehicles', href: '/dashboards/driver/vehicles' },
      { label: 'Trip History', href: '/dashboards/driver/trips' },
      { label: 'Fuel Expenses', href: '/dashboards/driver/expenses' },
    ],
    APPROVER: [
      { label: 'Pending Requests', href: '/dashboards/approver/requests' },
      { label: 'Approved History', href: '/dashboards/approver/history' },
    ],
    STAFF: [
      { label: 'My Vehicles', href: '/dashboards/staff/vehicles' },
      { label: 'Fuel Requests', href: '/dashboards/staff/requests' },
    ],
  };

  return [...commonItems, ...(role && roleSpecificItems[role] ? roleSpecificItems[role] : [])];
}
