import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthPageFooter } from "@/components/auth/auth-page-footer";
import { VerifyEmailCard } from "@/components/auth/verify-email-card";
import { AuthShell } from "@/components/layout/auth-shell";
import { AUTH_ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address for the Vehicle Fuel Management System",
};

function VerifyEmailFallback() {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-slate-200" />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Verify your email"
      description="Enter the verification code or follow the email instructions."
      panelWidth="compact"
      footer={
        <AuthPageFooter
          prompt="Need to register first?"
          actionLabel="Create your account"
          actionHref={AUTH_ROUTES.SIGNUP}
          supportingText="Only verified company staff can complete registration and platform access."
        />
      }
    >
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailCard />
      </Suspense>
    </AuthShell>
  );
}
