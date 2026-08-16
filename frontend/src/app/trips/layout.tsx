"use client";

import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function TripsLayout({
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
