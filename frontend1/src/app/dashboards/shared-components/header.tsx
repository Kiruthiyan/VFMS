/**
 * Shared Header Component for all dashboards
 * Displays user info, notifications, and profile menu
 */
'use client';

import { Menu } from 'lucide-react';

import { useAuthStore } from '@/store/auth-store';

interface DashboardHeaderProps {
  title: string;
  description: string;
  onMenuClick: () => void;
}

export function DashboardHeader({
  title,
  description,
  onMenuClick,
}: DashboardHeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="app-topbar sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Role workspace
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                {title}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            {description}
          </p>
          <div className="app-surface-soft rounded-3xl px-4 py-2.5">
            <p className="text-sm font-bold text-slate-950">{user?.fullName || 'User'}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {user?.role?.replace('_', ' ') || 'Authenticated'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
