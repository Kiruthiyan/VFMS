import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your FleetPro account password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your account email address and we will send password recovery instructions."
      panelWidth="compact"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
