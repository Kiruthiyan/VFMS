import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function ApprovalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <RoleGuard allowedRole="APPROVER">
        {children}
      </RoleGuard>
    </Suspense>
  );
}
