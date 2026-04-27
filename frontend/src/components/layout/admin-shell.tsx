'use client';

import Link from "next/link";
import { ReactNode } from "react";
import { useUser } from "@/lib/useUser";
import { AlertCircle } from "lucide-react";

interface AdminShellProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AdminShell({ children, requireAdmin = false }: AdminShellProps) {
  const { isAdmin, loading, user } = useUser();

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    );
  }

  // Show access denied message if admin-only content is requested
  if (requireAdmin && !isAdmin) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border-2 border-red-200 p-8 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={28} className="text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">
            Fuel Management module is restricted to <span className="font-semibold text-red-600">ADMIN users only</span>.
          </p>
          <p className="text-sm text-slate-500">
            Your current role: <span className="font-semibold">{user?.role ?? "Unknown"}</span>
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </main>
  );
}

