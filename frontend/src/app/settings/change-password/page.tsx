import type { Metadata } from "next";

import { AuthorizedShell } from "@/components/layout/authorized-shell";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Update your account password",
};

export default function ChangePasswordPage() {
  return (
    <AuthorizedShell
      pageTitle="Change Password"
      pageDescription="Keep your account secure with a strong, updated password."
    >
      <div className="max-w-2xl">
        <ChangePasswordForm />
      </div>
    </AuthorizedShell>
  );
}
