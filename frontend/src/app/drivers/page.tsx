'use client';

import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { Driver, PageResponse } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { DriverForm } from '@/components/drivers/DriverForm';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

type LicenseAlertLevel = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'UNKNOWN';

type LicenseAlertMeta = {
  level: LicenseAlertLevel;
  label: string;
  bg: string;
  text: string;
  border: string;
};

function getDaysUntil(expiryDate: string): number | null {
  if (!expiryDate) return null;

  const parsed = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const expiryStart = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  return Math.floor((expiryStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
}

function getLicenseAlertMeta(expiryDate: string): LicenseAlertMeta {
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

export default function DriversPage() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const d = await apiFetch<PageResponse<Driver>>(`/api/drivers?page=${page}&size=10`);
      setDrivers(d.content);
      setTotalPages(d.totalPages);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page]);

  const filtered = drivers.filter((d) =>
    `${d.firstName} ${d.lastName} ${d.employeeId} ${d.nic}`.toLowerCase().includes(search.toLowerCase())
  );

  const expiredCount = filtered.filter((driver) => getLicenseAlertMeta(driver.licenseExpiryDate).level === 'EXPIRED').length;
  const expiringSoonCount = filtered.filter((driver) => getLicenseAlertMeta(driver.licenseExpiryDate).level === 'EXPIRING_SOON').length;

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        icon={<Users className="w-5 h-5" />}
        title="Drivers"
        subtitle="Manage driver profiles"
        action={
          <div className="flex items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md font-medium transition-colors"
                  style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Driver
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-black dark:text-white">New Driver</DialogTitle>
                  <DialogDescription className="text-black/80 dark:text-white/80">
                    Fill in the driver details and submit the form to create a new driver profile.
                  </DialogDescription>
                </DialogHeader>
                <DriverForm
                  onSuccess={() => {
                    setOpen(false);
                    fetchDrivers();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">System Status</p>
            <p className="mt-1 text-sm font-semibold text-foreground">License Monitoring</p>
          </CardContent>
        </Card>
        <Card style={{ borderTopWidth: 3, borderTopStyle: 'solid', borderTopColor: 'hsl(360 79% 60%)' }}>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Expired Licenses</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: 'hsl(360 79% 36%)' }}>
              {expiredCount}
            </p>
          </CardContent>
        </Card>
        <Card style={{ borderTopWidth: 3, borderTopStyle: 'solid', borderTopColor: 'hsl(36 95% 54%)' }}>
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">Expiring in 30 Days</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: 'hsl(31 92% 34%)' }}>
              {expiringSoonCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, employee ID or NIC..."
              className="pl-9"
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              style={{ '--tw-ring-color': 'hsl(var(--ring))' } as React.CSSProperties}
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/40">
                    {['Employee ID', 'Name', 'NIC', 'Department', 'License Alert', 'Status', ''].map((h) => (
                      <TableHead key={h} className="text-xs font-medium text-muted-foreground">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow
                      key={d.id}
                      className="group"
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/drivers/${d.id}/overview`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          router.push(`/drivers/${d.id}/overview`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      onMouseEnter={(e: MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.backgroundColor = 'hsl(42 100% 50% / 0.06)')}
                      onMouseLeave={(e: MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.backgroundColor = '')}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        <Link href={`/drivers/${d.id}/overview`} onClick={(event) => event.stopPropagation()}>
                          {d.employeeId}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium text-sm text-foreground">
                        <Link href={`/drivers/${d.id}/overview`} onClick={(event) => event.stopPropagation()}>
                          {d.firstName} {d.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.nic}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.department || '-'} </TableCell>
                      <TableCell>
                        <LicenseAlertBadge expiryDate={d.licenseExpiryDate} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={d.status} />
                      </TableCell>
                      <TableCell>
                        <Link href={`/drivers/${d.id}/overview`} onClick={(event) => event.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-16 text-sm">
                        No drivers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
                <span className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'hsl(var(--primary))' }}
        >
          <span style={{ color: 'hsl(var(--primary-foreground))' }}>{icon}</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function LicenseAlertBadge({ expiryDate }: { expiryDate: string }) {
  const alert = getLicenseAlertMeta(expiryDate);

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
