'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, Star, Users } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { getDriverDisplayId } from '@/lib/driver-display';
import { queryKeys } from '@/lib/query-keys';
import { DriverReadinessCache, PageResponse } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/** Shape returned by GET /api/drivers/from-users (user-creation data for DRIVER role) */
interface DriverUser {
  id: string;
  employeeId: string | null;
  fullName: string;
  email: string;
  phone: string;
  nic: string;
  licenseNumber: string | null;
  licenseExpiryDate: string | null;
  certifications: string | null;
  experienceYears: number | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  /** Linked driver-table UUID (resolved by email). Used for sub-resource tabs. */
  driverId: string | null;
  /** Future Trip Scheduling / Staff Dashboard integration value from 0 to 100. */
  ratingPercentage?: number | null;
}

type LicenseAlertLevel = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNKNOWN';

type LicenseAlertMeta = {
  level: LicenseAlertLevel;
  label: string;
  bg: string;
  text: string;
  border: string;
};

type AvailabilityFilter = 'ALL' | 'AVAILABLE' | 'UNAVAILABLE';

const driverIdCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function compareDriverIds(left: DriverUser, right: DriverUser) {
  const leftDisplayId = getDriverDisplayId(left.employeeId, '');
  const rightDisplayId = getDriverDisplayId(right.employeeId, '');
  if (!leftDisplayId) return rightDisplayId ? 1 : 0;
  if (!rightDisplayId) return -1;
  return driverIdCollator.compare(leftDisplayId, rightDisplayId);
}

function getDaysUntil(expiryDate: string | null): number | null {
  if (!expiryDate) return null;

  const parsed = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const expiryStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  return Math.floor((expiryStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
}

function getLicenseAlertMeta(expiryDate: string | null): LicenseAlertMeta {
  const daysUntil = getDaysUntil(expiryDate);
  if (daysUntil === null) {
    return {
      level: 'UNKNOWN',
      label: 'No expiry date',
      bg: 'hsl(0 0% 96%)',
      text: 'hsl(0 0% 45%)',
      border: 'hsl(0 0% 80%)',
    };
  }

  if (daysUntil < 0) {
    return {
      level: 'EXPIRED',
      label: 'License expired',
      bg: 'hsl(360 79% 95%)',
      text: 'hsl(360 79% 30%)',
      border: 'hsl(360 79% 75%)',
    };
  }

  if (daysUntil <= 30) {
    const suffix = daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    return {
      level: 'EXPIRING_SOON',
      label: `Expires ${suffix}`,
      bg: 'hsl(42 97% 92%)',
      text: 'hsl(28 88% 28%)',
      border: 'hsl(36 95% 64%)',
    };
  }

  return {
    level: 'VALID',
    label: 'Valid',
    bg: 'hsl(145 63% 94%)',
    text: 'hsl(145 63% 25%)',
    border: 'hsl(145 63% 70%)',
  };
}

function getDriverReadiness(driver: DriverUser, readiness: DriverReadinessCache | null) {
  if (readiness) {
    const ready = readiness.ready ?? (readiness.licenseValid && !readiness.onLeaveToday);
    return {
      ready,
      reason: ready ? null : readiness.notReadyReason || (readiness.onLeaveToday ? 'On approved leave' : 'License expired'),
    };
  }

  if (!driver.licenseExpiryDate) return { ready: false, reason: 'No license expiry date' };
  const expiry = new Date(`${driver.licenseExpiryDate}T00:00:00`);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (Number.isNaN(expiry.getTime()) || expiry < todayStart) return { ready: false, reason: 'License expired' };
  return { ready: true, reason: null };
}

function getSafeRatingPercentage(ratingPercentage?: number | null) {
  if (typeof ratingPercentage !== 'number' || Number.isNaN(ratingPercentage)) return null;
  return Math.min(100, Math.max(0, ratingPercentage));
}

export default function DriversPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('ALL');

  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.drivers,
    queryFn: async () => {
      const [driverPage, readiness] = await Promise.all([
        apiFetch<PageResponse<DriverUser>>('/api/drivers/from-users?page=0&size=500'),
        apiFetch<DriverReadinessCache[]>('/api/drivers/readiness').catch(() => []),
      ]);
      return {
        drivers: [...driverPage.content].sort(compareDriverIds),
        readinessByDriverId: Object.fromEntries(readiness.map((item) => [item.driverId, item])),
      };
    },
  });

  const drivers = data?.drivers ?? [];
  const readinessByDriverId = data?.readinessByDriverId ?? {};
  const loading = isLoading;

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load drivers');
    }
  }, [error]);

  const readinessFor = (driver: DriverUser) =>
    getDriverReadiness(driver, driver.driverId ? readinessByDriverId[driver.driverId] ?? null : null);

  const filtered = drivers.filter((driver) => {
    const matchesSearch = `${getDriverDisplayId(driver.employeeId, '')} ${driver.fullName} ${driver.email} ${driver.nic} ${driver.phone}`
      .toLowerCase()
      .includes(search.toLowerCase());
    if (!matchesSearch) return false;
    const ready = readinessFor(driver).ready;
    if (availabilityFilter === 'AVAILABLE') return ready;
    if (availabilityFilter === 'UNAVAILABLE') return !ready;
    return true;
  });

  const expiredCount = filtered.filter((d) => getLicenseAlertMeta(d.licenseExpiryDate).level === 'EXPIRED').length;
  const expiringSoonCount = filtered.filter((d) => getLicenseAlertMeta(d.licenseExpiryDate).level === 'EXPIRING_SOON').length;
  const readyCount = drivers.filter((driver) => readinessFor(driver).ready).length;
  const notReadyCount = drivers.length - readyCount;

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      <PageHeader
        icon={Users}
        title="Drivers"
        description="Manage driver profiles"
      />

      <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: 'hsl(var(--success))' }}>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground">Ready to assign</p>
                <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: 'hsl(var(--success))' }}>{readyCount}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: 'hsl(19 97% 50%)' }}>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground">Not ready</p>
                <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: 'hsl(19 97% 40%)' }}>{notReadyCount}</p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p className="mb-1 text-xs font-medium text-amber-800">A driver is Not Ready if:</p>
            <ul className="list-inside list-disc space-y-0.5 text-xs text-amber-700">
              <li>Driver license is expired</li>
              <li>Driver is on approved leave</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground">System Status</p>
                <p className="mt-2 text-xl font-bold tracking-tight text-foreground">License Monitoring</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: 'hsl(360 79% 60%)' }}>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground">Expired Licenses</p>
                <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: 'hsl(360 79% 36%)' }}>
                  {expiredCount}
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-md transition-shadow border-t-4" style={{ borderTopColor: 'hsl(36 95% 54%)' }}>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground">Expiring in 30 Days</p>
                <p className="mt-2 text-3xl font-bold tracking-tight" style={{ color: 'hsl(31 92% 34%)' }}>
                  {expiringSoonCount}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Driver ID, name, email, NIC or phone..."
                  className="pl-9"
                  value={search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  style={{ '--tw-ring-color': 'hsl(var(--ring))' } as React.CSSProperties}
                />
              </div>
                <Select
                  value={availabilityFilter}
                  onValueChange={(value) => setAvailabilityFilter(value as AvailabilityFilter)}
                >
                  <SelectTrigger
                    aria-label="Filter drivers by availability"
                    className="h-10 w-full rounded-xl bg-white text-sm text-slate-900 sm:w-56"
                  >
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Drivers</SelectItem>
                    <SelectItem value="AVAILABLE">Available Drivers</SelectItem>
                    <SelectItem value="UNAVAILABLE">Unavailable Drivers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-slate-950 bg-slate-950">
                      {['Driver ID', 'Full Name', 'NIC', 'Phone', 'Rating', 'License Alert', 'Availability', 'Status'].map((h) => (
                        <TableHead key={h} className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((d) => {
                      const readiness = readinessFor(d);
                      return (
                        <TableRow
                          key={d.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => router.push(`/drivers/${d.id}`)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              router.push(`/drivers/${d.id}`);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                        >
                        <TableCell className="font-semibold text-sm text-foreground">
                          {getDriverDisplayId(d.employeeId, '-')}
                        </TableCell>
                        <TableCell className="font-medium text-sm text-foreground">
                          {d.fullName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{d.nic}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{d.phone || '-'}</TableCell>
                        <TableCell>
                          <DriverRating ratingPercentage={d.ratingPercentage} />
                        </TableCell>
                        <TableCell>
                          <LicenseAlertBadge expiryDate={d.licenseExpiryDate} />
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${readiness.ready ? 'border-green-300 bg-green-50 text-green-800' : 'border-orange-300 bg-orange-50 text-orange-800'}`}>
                            {readiness.ready ? 'Ready to assign' : 'Not ready'}
                          </span>
                          {!readiness.ready && readiness.reason && <p className="mt-1 text-xs text-muted-foreground">{readiness.reason}</p>}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={d.status} />
                        </TableCell>
                      </TableRow>
                      );
                    })}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-16 text-sm">
                          No drivers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

function LicenseAlertBadge({ expiryDate }: { expiryDate?: string | null }) {
  const alert = getLicenseAlertMeta(expiryDate ?? null);
  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{
        backgroundColor: alert.bg,
        color: alert.text,
        borderColor: alert.border,
      }}
    >
      {alert.label}
    </span>
  );
}

function DriverRating({ ratingPercentage }: { ratingPercentage?: number | null }) {
  const safeRating = getSafeRatingPercentage(ratingPercentage);

  if (safeRating === null) {
    return <span className="text-xs font-medium text-muted-foreground">Not rated</span>;
  }

  return (
    <div className="inline-flex items-center gap-2" title={`${safeRating}% driver rating`}>
      <div className="relative h-4 w-24" aria-label={`${safeRating}% driver rating`}>
        <div className="absolute inset-0 flex gap-0.5 text-muted-foreground/35">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={`empty-${index}`} className="h-4 w-4" />
          ))}
        </div>
        <div className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-500" style={{ width: `${safeRating}%` }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={`filled-${index}`} className="h-4 w-4 shrink-0 fill-current" />
          ))}
        </div>
      </div>
      <span className="text-xs font-semibold text-foreground">{safeRating}%</span>
    </div>
  );
}
