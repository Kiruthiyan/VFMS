import { Suspense } from 'react';
import { RoleGuard } from '@/components/auth/role-guard';

export const metadata = {
  title: 'Driver Portal | VFMS',
  description: 'Driver self-service portal for Fleet Management System',
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
