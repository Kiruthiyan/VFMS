'use client';

import { Bell, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { resolveBackendAssetUrl } from '@/lib/api';

interface DriverPortalHeaderProps {
  title: string;
  subtitle?: string;
  photoUrl?: string | null;
}

export function DriverPortalHeader({ title, subtitle, photoUrl }: DriverPortalHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const avatarSrc = photoUrl ? resolveBackendAssetUrl(photoUrl) : null;

  return (
    <header
      style={{
        height: '3.5rem',
        borderBottom: '1px solid hsl(var(--border))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: 'hsl(var(--background))',
        flexShrink: 0,
      }}
    >
      <div>
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'hsl(var(--foreground))', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          aria-label="Notifications"
          style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '0.5rem',
            border: '1px solid hsl(var(--border))',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          <Bell style={{ width: '0.875rem', height: '0.875rem' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Profile"
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid hsl(42 100% 50%)',
              }}
            />
          ) : (
            <span
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '50%',
                background: 'hsl(42 100% 50% / 0.15)',
                border: '2px solid hsl(42 100% 50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User style={{ width: '0.875rem', height: '0.875rem', color: 'hsl(42 100% 50%)' }} />
            </span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
              {user?.fullName ?? 'Driver'}
            </span>
            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--muted-foreground))' }}>
              Driver Portal
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
