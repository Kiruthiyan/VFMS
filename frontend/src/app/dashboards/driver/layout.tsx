import { Suspense } from 'react';
import { RoleGuard } from '@/components/auth/role-guard';
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata = {
  title: 'Driver Dashboard | VFMS',
  description: 'Driver dashboard for Vehicle Fleet Management System',
};

export default function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <RoleGuard allowedRole="DRIVER">
        <DashboardShell>{children}</DashboardShell>
      </RoleGuard>
    </Suspense>
  );
}
