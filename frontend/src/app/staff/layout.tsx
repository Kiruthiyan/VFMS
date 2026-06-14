import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { RoleGuard } from '@/components/auth/role-guard';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <RoleGuard allowedRoles={['APPROVER', 'ADMIN']}>
        {children}
      </RoleGuard>
    </Suspense>
  );
}
