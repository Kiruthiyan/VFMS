"use client";

import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function LeavesLayout({ children }: { children: React.ReactNode }) {
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
