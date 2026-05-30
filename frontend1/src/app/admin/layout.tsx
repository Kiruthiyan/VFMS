import { Suspense } from "react";

import { RoleGuard } from "@/components/auth/role-guard";

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
      <RoleGuard allowedRole="ADMIN">{children}</RoleGuard>
    </Suspense>
  );
}
