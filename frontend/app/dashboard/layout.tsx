'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    // Redirect to role-specific dashboard if on generic /dashboard
    if (pathname === '/dashboard') {
      switch (user.role) {
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        case 'APPROVER':
          router.push('/dashboard/approver');
          break;
        case 'STAFF':
          router.push('/dashboard/staff');
          break;
        case 'DRIVER':
          router.push('/dashboard/driver');
          break;
        default:
          router.push('/dashboard/staff');
      }
    }
  }, [isAuthenticated, user, router, pathname]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}

