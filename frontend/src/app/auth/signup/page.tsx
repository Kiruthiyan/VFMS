import type { Metadata } from "next";
import Link from "next/link";
import { Truck } from "lucide-react";
import { RegisterForm } from "@/components/forms/register-form";

export const metadata: Metadata = {
  title: "Create Account — VFMS",
  description: "Register for the Vehicle Fleet Management System",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/5 blur-[120px] rounded-full" />
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
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-100">
              Create your account
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Join the Vehicle Fleet Management System
            </p>
          </div>

          {/* Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
            <RegisterForm />
          </div>

          <p className="text-center text-xs text-slate-600 mt-6">
            University of Moratuwa · Team CodeCatalyst · 2026
          </p>
        </div>
      </div>
    </div>
  );
}