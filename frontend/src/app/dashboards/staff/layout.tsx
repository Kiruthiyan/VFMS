import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

/**
 * Staff Dashboard Layout
 * Protects all staff routes with role-based access control
 */
export const metadata = {
  title: "Staff Dashboard | VFMS",
  description: "Staff dashboard for VFMS",
};

export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <RoleGuard allowedRole="SYSTEM_USER">
        <DashboardShell>{children}</DashboardShell>
      </RoleGuard>
    </Suspense>
  );
}
