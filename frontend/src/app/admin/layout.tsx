import { Suspense } from "react";

import { RoleGuard } from "@/components/auth/role-guard";

export const metadata = {
  title: "Admin Panel | VFMS",
  description: "Administrative management area for VFMS",
};

export default function AdminRoutesLayout({
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
