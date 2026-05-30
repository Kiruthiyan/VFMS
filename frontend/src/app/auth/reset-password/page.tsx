"use client";

import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

function ResetPasswordContent() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Create a strong password to secure your FleetPro account."
      panelWidth="compact"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
