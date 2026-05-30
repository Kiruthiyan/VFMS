import { Suspense } from "react";

import { LoginForm } from "@/components/forms/login-form";
import { AuthShell } from "@/components/layout/auth-shell";

function LoginContent() {
  return (
    <AuthShell
      eyebrow="Secure sign in"
      title="Sign in to FleetPro"
      description="Access your role-based fleet dashboard with your company credentials."
      panelWidth="compact"
    >
      <LoginForm />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
