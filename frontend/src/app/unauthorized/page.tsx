import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";

export const metadata: Metadata = {
  title: "Unauthorized — VFMS",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-red-950/40 border border-red-800/40 flex items-center justify-center mx-auto">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>

        <div>
          <h1 className="text-4xl font-black text-slate-100 mb-2">403</h1>
          <h2 className="text-xl font-bold text-slate-300 mb-3">
            Access Denied
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            You do not have permission to access this page. Please contact
            your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center h-11 px-6
                       rounded-xl bg-amber-500 text-slate-900 font-bold
                       text-sm hover:bg-amber-400 transition-colors"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-6
                       rounded-xl border border-slate-700 text-slate-300
                       font-medium text-sm hover:bg-slate-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
