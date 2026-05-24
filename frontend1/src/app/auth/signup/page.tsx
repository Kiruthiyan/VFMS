<<<<<<< HEAD:frontend1/src/app/auth/signup/page.tsx
// PLACEHOLDER — Kiruthiyan will replace this in feature/auth-signup

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm w-full">
        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-6">
          V
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-sm text-gray-400">Signup feature coming soon...</p>
      </div>
    </div>
  );
}
=======
'use client';

import { Suspense } from 'react';

import { SignupForm } from '@/components/forms/signup-form';
import { AuthShell } from '@/components/layout/auth-shell';

function SignupContent() {
  return (
    <AuthShell
      eyebrow="Verified staff registration"
      title="Create your FleetPro account"
      description="Register using your verified company staff information."
      panelWidth="compact"
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
>>>>>>> origin/develop:frontend/src/app/auth/signup/page.tsx
