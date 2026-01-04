'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect to role-based dashboard
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
          router.push('/auth');
      }
    } else {
      router.push('/auth');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
