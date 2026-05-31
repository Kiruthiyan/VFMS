import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

/**
 * Fleet Dashboard Layout
 * Protects fleet operational routes (accessible by multiple roles)
 */
export const metadata = {
  title: "Fleet Operations | VFMS",
  description: "Fleet management operations for VFMS",
};

export default function FleetDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <RoleGuard allowedRoles={["ADMIN", "SYSTEM_USER", "APPROVER", "DRIVER"]}>
        <DashboardShell>
          {children}
        </DashboardShell>
      </RoleGuard>
    </Suspense>
  );
}
