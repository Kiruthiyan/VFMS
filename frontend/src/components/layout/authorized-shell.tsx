'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';

import { useUser } from '@/lib/useUser';

interface AuthorizedShellProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'DRIVER' | 'APPROVER' | 'SYSTEM_USER';
  pageTitle?: string;
  pageDescription?: string;
}

export function AuthorizedShell({
  children,
  requiredRole = 'ADMIN',
  pageTitle,
  pageDescription,
}: AuthorizedShellProps) {
  const { user, isAdmin, loading } = useUser();

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    );
  }

  const isAuthorized =
    requiredRole === 'ADMIN' ? isAdmin : user?.role === requiredRole;

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-red-600" strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 text-center mb-3">
              Access Denied
            </h1>
            <p className="text-slate-600 text-center mb-2">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-slate-500 text-center mb-6">
              Required Role: <span className="font-bold text-red-600">{requiredRole}</span>
              <br />
              Your Role: <span className="font-bold text-blue-600">{user?.role ?? 'Unknown'}</span>
            </p>

            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-semibold rounded-lg transition-colors"
              >
                <Home size={18} />
                <span>Go Home</span>
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center mt-6">
            Contact your administrator if you believe this is a mistake
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {pageTitle && (
        <header className="border-b border-slate-200 py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-slate-900">{pageTitle}</h1>
            {pageDescription && (
              <p className="text-slate-600 mt-1">{pageDescription}</p>
            )}
          </div>
        </header>
      )}

      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </main>
  );
}
