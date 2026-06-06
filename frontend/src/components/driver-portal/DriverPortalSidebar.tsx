'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  CreditCard,
  Award,
  FileText,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Wrench,
  LogOut,
  ChevronRight,
  Car,
} from 'lucide-react';
import { DRIVER_PORTAL_ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/store/auth-store';
import { logoutApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { AUTH_ROUTES } from '@/lib/constants/routes';

const NAV_ITEMS = [
  { label: 'My Profile',        href: DRIVER_PORTAL_ROUTES.PROFILE,          icon: User },
  { label: 'Licenses',          href: DRIVER_PORTAL_ROUTES.LICENSES,          icon: CreditCard },
  { label: 'Certifications',    href: DRIVER_PORTAL_ROUTES.CERTIFICATIONS,    icon: Award },
  { label: 'Documents',         href: DRIVER_PORTAL_ROUTES.DOCUMENTS,         icon: FileText },
  { label: 'Infractions',       href: DRIVER_PORTAL_ROUTES.INFRACTIONS,       icon: AlertTriangle },
  { label: 'My Trips',          href: DRIVER_PORTAL_ROUTES.TRIPS,             icon: MapPin },
  { label: 'Leave Requests',    href: DRIVER_PORTAL_ROUTES.LEAVE_REQUESTS,    icon: CalendarDays },
  { label: 'Service Requests',  href: DRIVER_PORTAL_ROUTES.SERVICE_REQUESTS,  icon: Wrench },
];

export function DriverPortalSidebar() {
  const pathname = usePathname();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  const handleLogout = async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    clearAuth();
    router.replace(AUTH_ROUTES.LOGIN);
  };

  return (
    <aside
      style={{
        width: '15rem',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, hsl(220 30% 8%) 0%, hsl(220 28% 11%) 100%)',
        borderRight: '1px solid hsl(220 20% 18%)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid hsl(220 20% 18%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              background: 'linear-gradient(135deg, hsl(42 100% 50%), hsl(28 100% 50%))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Car style={{ width: '1rem', height: '1rem', color: '#000' }} />
          </span>
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>FleetPro</p>
            <p style={{ fontSize: '0.65rem', color: 'hsl(220 10% 55%)', marginTop: '0.125rem' }}>Driver Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem' }}>
        <p
          style={{
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'hsl(220 10% 45%)',
            padding: '0 0.5rem',
            marginBottom: '0.5rem',
          }}
        >
          Navigation
        </p>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
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
                    position: 'relative',
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
                >
                  <Icon style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {active && <ChevronRight style={{ width: '0.75rem', height: '0.75rem', opacity: 0.6 }} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid hsl(220 20% 18%)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid transparent',
            background: 'transparent',
            color: 'hsl(220 10% 55%)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'hsl(0 80% 65%)';
            (e.currentTarget as HTMLElement).style.background = 'hsl(0 80% 50% / 0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'hsl(220 10% 55%)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut style={{ width: '1rem', height: '1rem' }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
