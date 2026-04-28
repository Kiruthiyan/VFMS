'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, CheckCircle2, ClipboardCheck, ShieldCheck, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    href: '/drivers/eligibility-check',
    label: 'Eligibility Check',
    icon: ShieldCheck,
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
  { key: 'performance', label: 'Performance' },
  { key: 'qualification', label: 'Qualification' },
] as const;

const moduleRoutes = [
  'assignment-readiness',
  'eligibility-check',
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
    <aside className={cn('h-full w-full rounded-2xl border border-border/70 bg-white shadow-sm', className)}>
      <div className="border-b border-border/60 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFB401]/15 text-[#FFB401]">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Driver Module</p>
            <p className="text-xs text-muted-foreground">Quick navigation</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-2 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all duration-200 hover:translate-x-1 hover:bg-gray-100',
                active ? 'bg-[#FFB401]/20 font-medium text-[#953002] shadow-sm' : 'text-gray-600'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors duration-200',
                  active ? 'text-[#FFB401]' : 'text-gray-500 group-hover:text-[#FFB401]'
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        {driverId && (
          <>
            <div className="my-2 border-t border-border/60" />
            <div className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
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
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all duration-200 hover:translate-x-1 hover:bg-gray-100',
                    active ? 'bg-[#FFB401]/20 font-medium text-[#953002] shadow-sm' : 'text-gray-600'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <span
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full transition-colors duration-200',
                      active ? 'bg-[#FFB401]' : 'bg-gray-400 group-hover:bg-[#FFB401]'
                    )}
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