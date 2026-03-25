/**
 * Shared Header Component for all dashboards
 * Displays user info, notifications, and profile menu
 */
'use client';

import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

export function DashboardHeader() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, <span className="text-amber-400">{user?.fullName || 'User'}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Role: {user?.role}</p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/settings/change-password"
            className="px-4 py-2 bg-amber-400/10 text-amber-400 rounded-lg hover:bg-amber-400/20 transition-colors text-sm font-medium"
          >
            Settings
          </Link>
          <button className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
