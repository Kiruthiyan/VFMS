import type { ReactNode } from 'react';
import { DriverSubSidebar } from '@/components/driver/DriverSubSidebar';

export default function DriversLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-6 lg:flex-row">
      <div className="w-full lg:w-[240px] lg:shrink-0">
        <DriverSubSidebar className="h-full lg:sticky lg:top-6" />
      </div>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}