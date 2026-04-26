import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

/**
 * Driver Dashboard Layout
 * Protects all driver routes with role-based access control
 */
export const metadata = {
  title: "Driver Dashboard | VFMS",
  description: "Driver dashboard for VFMS",
};

export default function DriverDashboardLayout({
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
