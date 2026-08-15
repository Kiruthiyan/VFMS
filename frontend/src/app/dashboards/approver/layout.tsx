import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

/**
 * Approver Dashboard Layout
 * Protects all approver routes with role-based access control
 */
export const metadata = {
  title: "Approver Dashboard | VFMS",
  description: "Approver dashboard for VFMS",
};

export default function ApproverDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <RoleGuard allowedRole="APPROVER">
        <DashboardShell>{children}</DashboardShell>
      </RoleGuard>
    </Suspense>
  );
}
