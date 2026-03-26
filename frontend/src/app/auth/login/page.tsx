import { LoginForm } from "@/components/forms/login-form";
import Link from "next/link";

export const metadata = {
  title: "Sign In — VFMS",
  description: "Secure sign-in for VFMS users",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Top Right Gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-slate-100/40 via-amber-50/25 to-transparent rounded-full blur-3xl" />
        {/* Bottom Left Gradient */}
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-slate-50/35 via-slate-50/15 to-transparent rounded-full blur-3xl" />
        {/* Center Accent */}
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-amber-50/20 via-transparent to-transparent rounded-full blur-2xl" />
      </div>

      {/* Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 font-black text-lg flex items-center justify-center group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-slate-900/20 transition-all duration-200">
              V
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              VFMS<span className="text-amber-500">.</span>
            </span>
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold px-5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 rounded-lg transition-all duration-200"
          >
            Create Account
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 pt-16 pb-8">
        <div className="w-full max-w-md">
          {/* Page Header with Better Hierarchy */}
          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-3 sm:mb-4 leading-tight">
              Welcome Back
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xs mx-auto">
              Sign in to access your VFMS workspace and manage fuel operations
            </p>
          </div>

          {/* Form Container - Enhanced Glassmorphism */}
          <div className="relative">
            {/* Gradient Border Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400/20 to-amber-400/10 rounded-2xl blur opacity-60" />
            <div className="relative bg-white/75 backdrop-blur-2xl rounded-2xl border border-slate-200/60 p-7 sm:p-9 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/15 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="relative">
                <LoginForm />
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-slate-500 mt-8">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-slate-900 hover:text-amber-600 transition-colors duration-200">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}