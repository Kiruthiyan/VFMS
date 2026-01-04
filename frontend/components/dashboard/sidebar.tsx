'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, UserRole } from '@/store/authStore';
import {
  LayoutDashboard,
  Fuel,
  Car,
  Users,
  Calendar,
  FileText,
  LogOut,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'APPROVER', 'STAFF', 'DRIVER'],
  },
  {
    title: 'Fuel Management',
    href: '/fuel',
    icon: Fuel,
    roles: ['ADMIN', 'APPROVER', 'STAFF'],
  },
  {
    title: 'Vehicles',
    href: '/vehicles',
    icon: Car,
    roles: ['ADMIN', 'APPROVER', 'STAFF'],
  },
  {
    title: 'Drivers',
    href: '/drivers',
    icon: Users,
    roles: ['ADMIN', 'APPROVER'],
  },
  {
    title: 'Trips',
    href: '/trips',
    icon: Calendar,
    roles: ['ADMIN', 'APPROVER', 'STAFF', 'DRIVER'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['ADMIN', 'APPROVER'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'APPROVER':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'STAFF':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'DRIVER':
        return 'bg-gradient-to-r from-purple-500 to-violet-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 shadow-lg">
      <div className="flex h-20 items-center border-b border-gray-200 dark:border-gray-800 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">VFMS</h1>
        </div>
      </div>
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 transition-transform',
                isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400',
                isActive && 'scale-110'
              )} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gradient-to-t from-gray-50 to-transparent dark:from-slate-800 dark:to-transparent">
        <div className="mb-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2 py-1 rounded-lg text-xs font-semibold text-white',
              getRoleBadgeColor(user.role)
            )}>
              {user.role}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start h-11 border-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-all"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

