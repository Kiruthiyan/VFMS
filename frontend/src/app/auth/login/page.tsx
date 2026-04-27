import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Sign In - VFMS",
  description: "Secure sign-in for VFMS users",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-slate-100/40 via-amber-50/25 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-slate-50/35 via-slate-50/15 to-transparent blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-amber-50/20 via-transparent to-transparent blur-2xl" />
      </div>

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-lg font-black text-amber-400 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-slate-900/20">
              V
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">
              VFMS<span className="text-amber-500">.</span>
            </span>
          </Link>

          <Link
            href="/auth/signup"
            className="rounded-lg px-5 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100/60 hover:text-slate-900"
          >
            Create Account
          </Link>
        </div>
      </nav>

      <div className="relative flex min-h-screen items-center justify-center px-4 pb-8 pt-16 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center sm:mb-12">
            <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900 sm:mb-4 sm:text-4xl lg:text-5xl">
              Welcome Back
            </h1>
            <p className="mx-auto max-w-xs text-base font-medium text-slate-600 sm:text-lg">
              Sign in to access your VFMS workspace and manage fuel operations.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-400/20 to-amber-400/10 opacity-60 blur" />
            <div className="relative rounded-2xl border border-slate-200/60 bg-white/75 p-7 shadow-xl shadow-slate-900/10 backdrop-blur-2xl transition-all duration-300 hover:shadow-slate-900/15 sm:p-9">
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="relative">
                <LoginForm />
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-slate-900 transition-colors duration-200 hover:text-amber-600"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
