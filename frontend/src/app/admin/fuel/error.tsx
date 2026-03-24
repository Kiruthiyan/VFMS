'use client';

import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface FuelPageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for fuel management pages
 * Displays user-friendly error messages
 */
export default function FuelPageError({ error, reset }: FuelPageErrorProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md">
        {/* Error Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-200 p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-orange-600" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-slate-600 text-center text-sm mb-6">
            We encountered an error loading the fuel management page.
          </p>

          {/* Error Details (Dev Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-mono text-red-600 break-words">
                {error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/admin/fuel"
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors text-center"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
