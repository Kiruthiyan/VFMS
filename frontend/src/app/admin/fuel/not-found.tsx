'use client';

import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * 404 Page Not Found - Fuel Management
 */
export default function FuelNotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Search size={40} className="text-blue-600" strokeWidth={1.5} />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Fuel Record Not Found
        </h2>
        <p className="text-slate-600 mb-8">
          The fuel record you're looking for doesn't exist or has been deleted.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/admin/fuel"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-950 hover:bg-blue-900 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Fuel Management</span>
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold rounded-lg transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
