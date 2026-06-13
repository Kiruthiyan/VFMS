import { Suspense } from 'react';
import { RoleGuard } from '@/components/auth/role-guard';

export const metadata = {
  title: 'Driver Dashboard | VFMS',
  description: 'Driver dashboard for Vehicle Fleet Management System',
};

export default function DriverDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <RoleGuard allowedRole="DRIVER">
        {children}
      </RoleGuard>
    </Suspense>
  );
}
