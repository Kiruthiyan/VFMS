import type { Metadata } from "next";

import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Secure sign-in for FleetPro users",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to FleetPro"
      description="Access your fleet workspace with your approved company account."
      panelWidth="compact"
    >
      <LoginForm />
    </AuthShell>
  );
}
