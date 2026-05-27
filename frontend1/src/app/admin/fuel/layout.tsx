'use client';

import { ReactNode } from 'react';

interface AdminFuelLayoutProps {
  children: ReactNode;
}

/**
 * Layout for Admin Fuel Management Section
 * 
 * Features:
 * - Consistent page structure
 * - Shared styling and spacing
 * - Professional header area
 */
export default function AdminFuelLayout({ children }: AdminFuelLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {children}
    </div>
  );
}
