import { AuthPageFooter } from "@/components/auth/auth-page-footer";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { AUTH_ROUTES } from "@/lib/constants/routes";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your VFMS account password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we will send recovery instructions."
      panelWidth="compact"
      footer={
        <AuthPageFooter
          prompt="Remembered your password?"
          actionLabel="Return to sign in"
          actionHref={AUTH_ROUTES.LOGIN}
          supportingText="Password recovery links are delivered only to registered account email addresses."
        />
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
