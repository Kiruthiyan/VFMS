import type { Metadata } from "next";

import { AuthPageFooter } from "@/components/auth/auth-page-footer";
import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/forms/login-form";
import { AUTH_ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Secure sign-in for VFMS users",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to VFMS."
      panelWidth="compact"
      footer={
        <AuthPageFooter
          prompt="Need a new account?"
          actionLabel="Create one"
          actionHref={AUTH_ROUTES.SIGNUP}
          supportingText="Registration is available only for verified company staff members."
        />
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
