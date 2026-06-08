'use client';

import { DriverPortalSidebar } from './DriverPortalSidebar';
import { DriverPortalHeader } from './DriverPortalHeader';

interface DriverPortalShellProps {
  title: string;
  subtitle?: string;
  photoUrl?: string | null;
  children: React.ReactNode;
}

export function DriverPortalShell({ title, subtitle, photoUrl, children }: DriverPortalShellProps) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'hsl(var(--background))',
        fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
      }}
    >
      <DriverPortalSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DriverPortalHeader title={title} subtitle={subtitle} photoUrl={photoUrl} />

        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '1.5rem',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
