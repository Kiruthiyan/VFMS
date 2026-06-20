import { Suspense } from "react";
import { FleetAccessGuard } from "@/components/auth/fleet-access-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

/**
 * Fleet Dashboard Layout
 * Protects fleet operational routes (accessible by multiple roles).
 * DashboardShell provides the sidebar + layout for ALL fleet pages.
 * When a user navigates here from any role dashboard, the previous
 * page's shell is replaced — no double nesting occurs.
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
      <FleetAccessGuard>
        <DashboardShell>
          {children}
        </DashboardShell>
      </FleetAccessGuard>
    </Suspense>
  );
}
