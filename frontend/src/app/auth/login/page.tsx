import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Secure sign-in for VFMS users",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to VFMS."
      actionHref="/auth/signup"
      actionLabel="Create Account"
      panelWidth="compact"
      footer={
        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-slate-900 transition-colors hover:text-amber-600"
          >
            Sign up here
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
