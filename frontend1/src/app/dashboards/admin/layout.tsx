import { Suspense } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

/**
 * Admin Dashboard Layout
 * Protects all admin routes with role-based access control
 */
export const metadata = {
  title: "Admin Dashboard | VFMS",
  description: "Administrator dashboard for VFMS",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <RoleGuard allowedRole="ADMIN">
        {children}
      </RoleGuard>
    </Suspense>
  );
}
