import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <RoleGuard allowedRole="DRIVER">
        {children}
      </RoleGuard>
    </Suspense>
  );
}
