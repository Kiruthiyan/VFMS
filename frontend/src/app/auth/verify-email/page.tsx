import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Truck, Loader2 } from "lucide-react";
import { VerifyEmailCard } from "@/components/auth/verify-email-card";

export const metadata: Metadata = {
  title: "Verify Email — VFMS",
  description: "Verify your email address for the Vehicle Fleet Management System",
};

// Suspense fallback while token is being read from URL
function VerifyEmailFallback() {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
        <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
      </div>
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-slate-700/20 blur-[120px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-base font-black tracking-tighter text-slate-100">
              FLEET<span className="text-amber-500">PRO</span>
            </span>
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-slate-400 hover:text-slate-100 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
            <Suspense fallback={<VerifyEmailFallback />}>
              <VerifyEmailCard />
            </Suspense>
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            University of Moratuwa · Team CodeCatalyst · 2026
          </p>
        </div>
      </div>
    </div>
  );
}
