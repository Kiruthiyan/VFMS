"use client";

import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DriversLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <RoleGuard allowedRoles={["APPROVER", "ADMIN"]}>
        <DashboardShell>
          {children}
        </DashboardShell>
      </RoleGuard>
    </Suspense>
  );
}
