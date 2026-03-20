import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <RoleGuard allowedRole="SYSTEM_USER">
        {children}
      </RoleGuard>
    </Suspense>
  );
}
