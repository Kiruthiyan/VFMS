'use client';

import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function FuelNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-900 text-amber-400">
            <Search size={36} strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-950">404</h1>
        <h2 className="mb-3 text-2xl font-bold text-slate-950">
          Fuel Record Not Found
        </h2>
        <p className="mb-8 text-sm leading-7 text-slate-500">
          The fuel record you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/admin/fuel"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
            <span>Back to Fuel Management</span>
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
