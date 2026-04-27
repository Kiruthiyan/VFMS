'use client';

import { useAuthStore } from '@/store/auth-store';

export function useUser() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const authUser = useAuthStore((state) => state.user);

  const user = authUser
    ? {
        id: authUser.userId,
        name: authUser.fullName,
        role: authUser.role,
      }
    : null;

  return {
    user,
    loading: !hydrated,
    isAdmin: authUser?.role === 'ADMIN',
    isDriver: authUser?.role === 'DRIVER',
    isApprover: authUser?.role === 'APPROVER',
    isSystemUser: authUser?.role === 'SYSTEM_USER',
  };
}
