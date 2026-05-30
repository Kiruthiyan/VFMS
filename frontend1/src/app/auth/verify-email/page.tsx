"use client";

import { Suspense } from "react";

import { VerifyEmailCard } from "@/components/auth/verify-email-card";
import { AuthShell } from "@/components/layout/auth-shell";

function VerifyEmailContent() {
  return (
    <AuthShell
      eyebrow="Email verification"
      title="Confirm your email address"
      description="Verify your company email to activate your FleetPro staff account."
      panelWidth="compact"
    >
      <VerifyEmailCard />
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
