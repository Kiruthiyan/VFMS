'use client';

import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function DriversPage() {
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

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        icon={<Users className="w-5 h-5" />}
        title="Drivers"
        subtitle="Manage driver profiles"
        action={
          <div className="flex items-center gap-2">
            <Link href="/drivers/eligibility">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
              >
                Eligibility Check
              </Button>
            </Link>

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
                    {['Employee ID', 'Name', 'NIC', 'Department', 'Status', ''].map((h) => (
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
                      onMouseEnter={(e: MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.backgroundColor = 'hsl(42 100% 50% / 0.06)')}
                      onMouseLeave={(e: MouseEvent<HTMLTableRowElement>) => (e.currentTarget.style.backgroundColor = '')}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">{d.employeeId}</TableCell>
                      <TableCell className="font-medium text-sm text-foreground">
                        {d.firstName} {d.lastName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.nic}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{d.department || '-'} </TableCell>
                      <TableCell>
                        <StatusBadge status={d.status} />
                      </TableCell>
                      <TableCell>
                        <Link href={`/drivers/${d.id}`}>
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
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-16 text-sm">
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
