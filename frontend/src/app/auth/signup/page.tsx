'use client';

import { Suspense } from 'react';
import { SignupForm } from '@/components/forms/signup-form';
import Link from 'next/link';

function SignupContent() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50/30 to-white">
      
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-slate-100/40 via-amber-50/25 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-slate-50/35 via-slate-50/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-amber-50/20 via-transparent to-transparent rounded-full blur-2xl" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 font-black flex items-center justify-center">
              V
            </div>
            <span className="text-sm font-bold text-slate-900">
              VFMS<span className="text-amber-500">.</span>
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="text-sm font-semibold px-5 py-2 text-slate-700 hover:bg-slate-100/60 rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-20">
        <div className="w-full max-w-md">

          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-3">
              Create Account
            </h1>
            <p className="text-slate-600">
              Join VFMS and manage your fleet operations
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/75 backdrop-blur-2xl rounded-2xl border border-slate-200 p-8 shadow-xl">
            <SignupForm />
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-slate-900">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}