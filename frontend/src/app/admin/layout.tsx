import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata = {
  title: "Admin | VFMS",
  description: "Administrator tools for VFMS",
};

export default function AdminLayout({
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
