'use client';

import { Suspense } from 'react';
import Link from 'next/link';

import { SignupForm } from '@/components/forms/signup-form';
import { AuthShell } from '@/components/layout/auth-shell';

function SignupContent() {
  return (
    <AuthShell
      title="Create your account"
      description="Register to access the VFMS platform."
      actionHref="/auth/login"
      actionLabel="Sign In"
      panelWidth="wide"
      footer={
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-slate-900 hover:text-amber-600">
            Sign in
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
