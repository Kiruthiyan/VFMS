import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your VFMS account",
};

function ResetFallback() {
  return (
    <div className="text-center space-y-3">
      <div className="mx-auto flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-slate-200" />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      description="Choose a strong password for your account."
      actionHref="/auth/login"
      actionLabel="Sign In"
      panelWidth="compact"
      footer={
        <p className="text-center text-xs text-slate-500">
          Need a new reset link?{" "}
          <Link href="/auth/forgot-password" className="font-semibold text-slate-900 hover:text-amber-600">
            Request one here
          </Link>
        </p>
      }
    >
      <Suspense fallback={<ResetFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
