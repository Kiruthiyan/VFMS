'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, LayoutDashboard, RefreshCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Driver, DriverReadinessCache, PageResponse } from '@/types';

export default function DriverReadinessPage() {
  const [drivers, setDrivers] = useState<DriverReadinessCache[]>([]);
  const [driverIdMap, setDriverIdMap] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const [readinessData, driversPage] = await Promise.all([
        apiFetch<DriverReadinessCache[]>('/api/drivers/readiness'),
        apiFetch<PageResponse<Driver>>('/api/drivers?page=0&size=500'),
      ]);

      const map = Object.fromEntries(driversPage.content.map((driver) => [driver.id, driver.employeeId]));

      setDrivers(readinessData);
      setDriverIdMap(map);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshDriver = async (driverId: string) => {
    try {
      await apiFetch(`/api/drivers/${driverId}/readiness/refresh`, { method: 'POST' });
      toast.success('Refreshed');
      fetchDrivers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const ready = drivers.filter((d) => d.licenseValid && d.allCertsValid && d.availabilityStatus === 'AVAILABLE');
  const busy = drivers.filter((d) => ['ON_TRIP', 'ON_LEAVE'].includes(d.availabilityStatus));
  const hasIssues = drivers.filter((d) => !d.licenseValid || !d.allCertsValid);
  const getDisplayDriverId = (driverUuid: string) => driverIdMap[driverUuid] ?? driverUuid;
  const filtered = drivers.filter((d) => {
    const query = search.toLowerCase();
    return (
      getDisplayDriverId(d.driverId).toLowerCase().includes(query) ||
      d.driverId.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            <LayoutDashboard className="w-5 h-5" style={{ color: 'hsl(var(--primary-foreground))' }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Assignment Readiness</h1>
            <p className="text-sm text-muted-foreground">Real-time driver readiness cache</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/drivers" className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-border hover:bg-muted transition-colors">
            Back
          </Link>
          <button
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md font-medium border transition-colors"
            style={{
              borderColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary))',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--primary))';
              e.currentTarget.style.color = 'hsl(var(--primary-foreground))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'hsl(var(--primary))';
            }}
            onClick={fetchDrivers}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <Card style={{ borderTopWidth: 4, borderTopStyle: 'solid', borderTopColor: 'hsl(var(--success))' }}>
          <CardContent className="pt-4 pb-4 px-4">
            <p className="text-3xl font-bold tabular-nums" style={{ color: 'hsl(var(--success))' }}>
              {ready.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Ready to assign</p>
          </CardContent>
        </Card>

        <Card style={{ borderTopWidth: 4, borderTopStyle: 'solid', borderTopColor: 'hsl(var(--primary))' }}>
          <CardContent className="pt-4 pb-4 px-4">
            <p className="text-3xl font-bold tabular-nums" style={{ color: 'hsl(var(--primary))' }}>
              {busy.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">On trip / leave</p>
          </CardContent>
        </Card>

        <Card style={{ borderTopWidth: 4, borderTopStyle: 'solid', borderTopColor: 'hsl(var(--secondary))' }}>
          <CardContent className="pt-4 pb-4 px-4">
            <p className="text-3xl font-bold tabular-nums" style={{ color: 'hsl(var(--secondary))' }}>
              {hasIssues.length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Has issues</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 px-4 pt-4">
          <Input
            placeholder="Search by driver ID..."
            className="h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40">
                  {['Driver ID', 'Availability', 'License', 'Certs', 'Ready', 'Last Refreshed', ''].map((h) => (
                    <TableHead key={h} className="text-xs font-medium text-muted-foreground">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => {
                  const isReady = d.licenseValid && d.allCertsValid && d.availabilityStatus === 'AVAILABLE';
                  return (
                    <TableRow key={d.driverId} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">{getDisplayDriverId(d.driverId)}</TableCell>
                      <TableCell>
                        <StatusBadge status={d.availabilityStatus} />
                      </TableCell>
                      <TableCell>
                        {d.licenseValid ? (
                          <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(var(--success))' }} />
                        ) : (
                          <XCircle className="w-4 h-4" style={{ color: 'hsl(var(--secondary))' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {d.allCertsValid ? (
                          <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(var(--success))' }} />
                        ) : (
                          <XCircle className="w-4 h-4" style={{ color: 'hsl(var(--secondary))' }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border"
                          style={
                            isReady
                              ? {
                                  backgroundColor: 'hsl(145 63% 94%)',
                                  color: 'hsl(145 63% 25%)',
                                  borderColor: 'hsl(145 63% 70%)',
                                }
                              : {
                                  backgroundColor: 'hsl(19 97% 93%)',
                                  color: 'hsl(19 97% 20%)',
                                  borderColor: 'hsl(19 97% 60%)',
                                }
                          }
                        >
                          {isReady ? 'Ready' : 'Not Ready'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">
                        {new Date(d.lastRefreshed).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'hsl(var(--primary))';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '';
                          }}
                          onClick={() => refreshDriver(d.driverId)}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-16 text-sm">
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
  );
}
