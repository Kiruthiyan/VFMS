import type { Metadata } from "next";
import Link from "next/link";
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
      description="Enter the verification code or follow the email instructions."
      actionHref="/auth/login"
      actionLabel="Sign In"
      panelWidth="compact"
      footer={
        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-slate-900 transition-colors hover:text-amber-600"
          >
            Create one
          </Link>
        </p>
      }
    >
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailCard />
      </Suspense>
    </AuthShell>
  );
}
