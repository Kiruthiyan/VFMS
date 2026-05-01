'use client';

import { Suspense } from 'react';

import { AuthPageFooter } from '@/components/auth/auth-page-footer';
import { SignupForm } from '@/components/forms/signup-form';
import { AuthShell } from '@/components/layout/auth-shell';
import { AUTH_ROUTES } from '@/lib/constants/routes';

function SignupContent() {
  return (
    <AuthShell
      eyebrow="Verified staff registration"
      title="Create Your VFMS Account"
      description="Register with your verified company staff details."
      panelWidth="standard"
      footer={
        <AuthPageFooter
          prompt="Already have an account?"
          actionLabel="Sign in"
          actionHref={AUTH_ROUTES.LOGIN}
          supportingText="Verified company staff can sign in after email confirmation and approval."
        />
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
