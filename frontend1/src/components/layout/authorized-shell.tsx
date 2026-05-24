'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { AlertCircle, ChevronLeft, Home } from 'lucide-react';

import { useUser } from '@/lib/useUser';

interface AuthorizedShellProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'DRIVER' | 'APPROVER' | 'SYSTEM_USER';
  pageTitle?: string;
  pageDescription?: string;
}

export function AuthorizedShell({
  children,
  requiredRole,
  pageTitle,
  pageDescription,
}: AuthorizedShellProps) {
  const { user, isAdmin, loading } = useUser();

  if (loading) {
    return (
      <main className="app-shell-background min-h-screen text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    );
  }

  const isAuthorized =
    !requiredRole || (requiredRole === 'ADMIN' ? isAdmin : user?.role === requiredRole);

  if (!isAuthorized) {
    return (
      <main className="app-shell-background flex min-h-screen items-center justify-center p-4">
        <div className="max-w-lg">
          <div className="app-surface-card rounded-[28px] p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={30} strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="mb-3 text-center text-2xl font-black tracking-tight text-slate-950">
              Access Denied
            </h1>
            <p className="mb-2 text-center text-sm leading-6 text-slate-500">
              You don&apos;t have permission to access this page.
            </p>
            <p className="mb-6 text-center text-sm text-slate-500">
              Required Role:{' '}
              <span className="font-bold text-red-600">
                {requiredRole ?? 'Authenticated user'}
              </span>
              <br />
              Your Role:{' '}
              <span className="font-bold text-blue-600">{user?.role ?? 'Unknown'}</span>
            </p>

            <div className="flex gap-3">
              <Link
                href="/"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                <Home size={18} />
                <span>Go Home</span>
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
                Go Back
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Contact your administrator if you believe this is a mistake
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell-background min-h-screen text-slate-900">
      {pageTitle && (
        <header className="app-topbar sticky top-0 z-30">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Account Settings
              </p>
              <div className="mt-1.5">
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                  {pageTitle}
                </span>
              </div>
            </div>
            {pageDescription && (
              <p className="max-w-xl text-sm leading-6 text-slate-500">
                {pageDescription}
              </p>
            )}
          </div>
        </header>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
