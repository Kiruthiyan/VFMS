import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthPageFooter } from "@/components/auth/auth-page-footer";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { AUTH_ROUTES } from "@/lib/constants/routes";

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
      panelWidth="compact"
      footer={
        <AuthPageFooter
          prompt="Need a new reset link?"
          actionLabel="Request another one"
          actionHref={AUTH_ROUTES.FORGOT_PASSWORD}
          supportingText="For security, reset links expire automatically after a limited time."
        />
      }
    >
      <Suspense fallback={<ResetFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
