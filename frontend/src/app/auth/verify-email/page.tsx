import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { VerifyEmailCard } from "@/components/auth/verify-email-card";

export const metadata: Metadata = {
  title: "Verify Email — VFMS",
  description: "Verify your email address for the Vehicle Fleet Management System",
};

// Suspense fallback while token is being read from URL
function VerifyEmailFallback() {
  return (
    <div className="text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto animate-pulse" />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      {/* Decorative Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-slate-100/40 via-amber-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-slate-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 font-black text-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-slate-900/20 transition-all duration-200">
              V
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              VFMS<span className="text-amber-500">.</span>
            </span>
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-semibold px-4 py-2 text-slate-700 hover:text-amber-600 transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 pt-16 pb-8">
        <div className="w-full max-w-md">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-2 sm:mb-3">
              Verify Email
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Confirm your email address to activate your account
            </p>
          </div>

          {/* Form Container */}
          <div className="relative">
            {/* Gradient Border Effect */}
            <div className="absolute -inset-px bg-gradient-to-r from-amber-500/20 via-slate-400/20 to-amber-500/20 rounded-2xl blur opacity-50" />
            <div className="absolute inset-0 bg-white rounded-2xl" />
            
            {/* Form Content */}
            <div className="relative bg-gradient-to-br from-white via-slate-50 to-white rounded-2xl p-6 sm:p-8 border border-white shadow-lg shadow-slate-900/5">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50/30 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <Suspense fallback={<VerifyEmailFallback />}>
                  <VerifyEmailCard />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-600 mt-6">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-slate-900 hover:text-amber-600 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
