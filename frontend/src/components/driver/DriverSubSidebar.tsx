'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, CheckCircle2, ClipboardCheck, ShieldCheck, Wrench } from 'lucide-react';

type DriverSubSidebarProps = {
  className?: string;
};

const items = [
  {
    href: '/drivers',
    label: 'Drivers',
    icon: CheckCircle2,
  },
  {
    href: '/drivers/assignment-readiness',
    label: 'Assignment Readiness',
    icon: ClipboardCheck,
  },
  {
    href: '/drivers/leave-requests',
    label: 'Leave Requests',
    icon: CalendarDays,
  },
  {
    href: '/drivers/service-requests',
    label: 'Service Requests',
    icon: Wrench,
  },
] as const;

const profileSections = [
  { key: 'overview', label: 'Overview' },
  { key: 'licenses', label: 'Licenses' },
  { key: 'certs', label: 'Certs' },
  { key: 'documents', label: 'Documents' },
  { key: 'availability', label: 'Availability' },
  { key: 'infractions', label: 'Infractions' },
  { key: 'trips', label: 'Trips' },
] as const;

const moduleRoutes = [
  'assignment-readiness',
  'leave-requests',
  'service-requests',
] as const;

export function DriverSubSidebar({ className }: DriverSubSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const pathParts = pathname.split('/').filter(Boolean);
  const driverId =
    pathParts[0] === 'drivers' && pathParts[1] && !moduleRoutes.includes(pathParts[1] as (typeof moduleRoutes)[number])
      ? pathParts[1]
      : undefined;

  const isProfileSectionActive = (section: (typeof profileSections)[number]['key']) => {
    if (!driverId) return false;
    if (section === 'overview') {
      return pathname === `/drivers/${driverId}` || pathname === `/drivers/${driverId}/overview`;
    }

    return pathname === `/drivers/${driverId}/${section}`;
  };

  return (
    <aside
      className={className}
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '1rem',
        background: 'linear-gradient(180deg, hsl(220 30% 8%) 0%, hsl(220 28% 11%) 100%)',
        border: '1px solid hsl(220 20% 18%)',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid hsl(220 20% 18%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, hsl(42 100% 50%), hsl(28 100% 50%))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#000' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>Driver Module</p>
            <p style={{ fontSize: '0.65rem', color: 'hsl(220 10% 55%)', marginTop: '0.125rem' }}>Quick navigation</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.8125rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'hsl(42 100% 60%)' : 'hsl(220 10% 65%)',
                background: active ? 'hsl(42 100% 50% / 0.12)' : 'transparent',
                border: active ? '1px solid hsl(42 100% 50% / 0.2)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                  (e.currentTarget as HTMLElement).style.background = 'hsl(220 20% 18%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.color = 'hsl(220 10% 65%)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                style={{
                  width: '1rem',
                  height: '1rem',
                  flexShrink: 0,
                  color: active ? 'hsl(42 100% 60%)' : 'hsl(220 10% 65%)',
                }}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {driverId && (
          <>
            <div style={{ margin: '0.5rem 0', borderTop: '1px solid hsl(220 20% 18%)' }} />
            <div style={{ padding: '0 0.75rem 0.25rem', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'hsl(220 10% 45%)' }}>
              Driver Profile
            </div>
            {profileSections.map((section) => {
              const href =
                section.key === 'overview'
                  ? `/drivers/${driverId}/overview`
                  : `/drivers/${driverId}/${section.key}`;

              const active = isProfileSectionActive(section.key);

              return (
                <Link
                  key={section.key}
                  href={href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'hsl(42 100% 60%)' : 'hsl(220 10% 65%)',
                    background: active ? 'hsl(42 100% 50% / 0.12)' : 'transparent',
                    border: active ? '1px solid hsl(42 100% 50% / 0.2)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = '#fff';
                      (e.currentTarget as HTMLElement).style.background = 'hsl(220 20% 18%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = 'hsl(220 10% 65%)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    style={{
                      height: '0.375rem',
                      width: '0.375rem',
                      flexShrink: 0,
                      borderRadius: '9999px',
                      backgroundColor: active ? 'hsl(42 100% 60%)' : 'hsl(220 10% 45%)',
                      transition: 'background-color 0.2s',
                    }}
                  />
                  <span className="truncate">{section.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}