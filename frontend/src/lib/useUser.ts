'use client';

import { useEffect, useState } from 'react';

export interface MockUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'DRIVER' | 'APPROVER' | 'SYSTEM_USER';
}

const DEFAULT_ADMIN_USER: MockUser = {
  id: 'admin-1',
  name: 'Admin User',
  role: 'ADMIN',
};

const DEFAULT_DRIVER_USER: MockUser = {
  id: 'driver-1',
  name: 'Driver User',
  role: 'DRIVER',
};

export function useUser() {
  const [user, setUser] = useState<MockUser>(DEFAULT_ADMIN_USER);
  const [loading, setLoading] = useState(false);

  // Check for user role from localStorage (for testing different roles)
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem('user-role') as MockUser['role'] | null;
      if (savedRole && ['ADMIN', 'DRIVER', 'APPROVER', 'SYSTEM_USER'].includes(savedRole)) {
        setUser(prev => ({ ...prev, role: savedRole }));
      }
    } catch (error) {
      console.log('Could not load user role from localStorage');
    }
  }, []);

  const setUserRole = (role: MockUser['role']) => {
    setUser(prev => ({ ...prev, role }));
    localStorage.setItem('user-role', role);
  };

  const isAdmin = user.role === 'ADMIN';
  const isDriver = user.role === 'DRIVER';

  return {
    user,
    loading,
    setUserRole,
    isAdmin,
    isDriver,
  };
}

export const mockUsers = {
  default: DEFAULT_ADMIN_USER,
  driver: DEFAULT_DRIVER_USER,
};
