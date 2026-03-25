import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password — VFMS",
  description: "Reset your VFMS account password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Subtle Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-slate-100/25 via-amber-50/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-slate-50/30 via-slate-50/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-50/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 font-black text-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              V
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              VFMS<span className="text-amber-500">.</span>
            </span>
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-semibold px-4 py-2 text-slate-700 hover:text-slate-900 transition-colors duration-200"
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
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-2 sm:mb-3">
              Forgot Password?
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              We&apos;ll help you reset it
            </p>
          </div>

          {/* Form Container - Glassmorphism */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/70 p-6 sm:p-8 shadow-2xl shadow-slate-900/5 hover:shadow-slate-900/10 transition-all duration-300">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-50/40 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}