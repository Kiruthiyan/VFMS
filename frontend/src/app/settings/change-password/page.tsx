import type { Metadata } from "next";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Update your account password",
};

export default function ChangePasswordPage() {
  return (
    <DashboardShell
      title="Change Password"
      description="Keep your account secure with a strong, updated password."
    >
      <div className="max-w-none">
        <ChangePasswordForm />
      </div>
    </DashboardShell>
  );
}
