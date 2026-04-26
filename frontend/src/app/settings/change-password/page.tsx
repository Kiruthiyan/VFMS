import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export const metadata: Metadata = {
  title: "Change Password — VFMS",
  description: "Update your account password",
};

export default function ChangePasswordPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
