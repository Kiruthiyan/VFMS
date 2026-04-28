import type { Metadata } from "next";
import Link from "next/link";
import { ShieldX } from "lucide-react";

export const metadata: Metadata = {
  title: "Unauthorized",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-red-50 text-red-600">
          <ShieldX className="h-10 w-10" />
        </div>

        <div>
          <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-950">403</h1>
          <h2 className="mb-3 text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-sm leading-7 text-slate-500">
            You do not have permission to access this page. Please contact
            your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-400 px-6 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
