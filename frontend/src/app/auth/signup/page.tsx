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
