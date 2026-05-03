import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyEmailCard } from "@/components/auth/verify-email-card";
import { AuthShell } from "@/components/layout/auth-shell";

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
      description="Confirm your company email so FleetPro can finish your account setup securely."
      panelWidth="compact"
    >
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailCard />
      </Suspense>
    </AuthShell>
  );
}
