import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your VFMS account password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we will send recovery instructions."
      actionHref="/auth/login"
      actionLabel="Sign In"
      panelWidth="compact"
      footer={
        <p className="text-center text-xs text-slate-500">
          Remembered your password?{" "}
          <Link href="/auth/login" className="font-semibold text-slate-900 hover:text-amber-600">
            Go back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
