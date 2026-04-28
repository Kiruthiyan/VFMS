'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface FuelPageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function FuelPageError({ error, reset }: FuelPageErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={30} strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="mb-2 text-center text-2xl font-black tracking-tight text-slate-950">
            Oops! Something went wrong
          </h1>
          <p className="mb-6 text-center text-sm leading-6 text-slate-500">
            We encountered an error loading the fuel management page.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="break-words text-xs font-mono text-red-600">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Try Again
            </button>
            <Link
              href="/admin/fuel"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
