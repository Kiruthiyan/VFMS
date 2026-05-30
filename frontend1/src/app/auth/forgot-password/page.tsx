"use client";

import { Suspense } from "react";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

function ForgotPasswordContent() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your company email address and we will send you a secure reset link."
      panelWidth="compact"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
