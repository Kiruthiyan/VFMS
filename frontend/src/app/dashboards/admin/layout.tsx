import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

/**
 * Admin Dashboard Layout
 * Protects all admin routes with role-based access control
 */
export const metadata = {
  title: "Admin Dashboard | VFMS",
  description: "Administrator dashboard for VFMS",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <RoleGuard allowedRole="ADMIN">
        <DashboardShell>{children}</DashboardShell>
      </RoleGuard>
    </Suspense>
  );
}
