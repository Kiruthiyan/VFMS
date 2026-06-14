'use client';
import { useState, useEffect, type ChangeEvent, type ReactNode } from 'react';
import { getStaffList, UserSummaryResponse } from '@/lib/api/staff-profile';
import { useAuthStore } from '@/store/auth-store';
import { StatusBadge } from '../../components/StatusBadge';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Eye, Search, Users2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function StaffPage() {
  const currentUser = useAuthStore((state) => state.user);

  const [staff, setStaff] = useState<UserSummaryResponse[]>([]);
  const [search, setSearch] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [activeStaff, setActiveStaff] = useState<UserSummaryResponse | null>(null);

  const fetchStaff = () =>
    getStaffList()
      .then((d) => setStaff(d))
      .catch((e) => toast.error(e?.response?.data?.message ?? e.message ?? 'Failed to load staff'));

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenView = (s: UserSummaryResponse) => {
    setActiveStaff(s);
    setViewOpen(true);
  };

  const filtered = staff.filter((s) =>
    `${s.fullName} ${s.employeeId} ${s.department ?? ''} ${s.email ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          icon={<Users2 className="w-5 h-5" />}
          title="Staff"
          subtitle="View staff members (SYSTEM_USER &amp; APPROVER)"
        />

        <Card className="shadow-sm border-muted">
          <CardHeader className="pb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, employee ID, department or email…"
                className="pl-9 text-sm"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40">
                  {['Employee ID', 'Name', 'Email', 'Department', 'Role', 'Status', ''].map((h) => (
                    <TableHead key={h} className="text-xs font-medium text-muted-foreground">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow
                    key={s.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.employeeId || '—'}
                    </TableCell>
                    <TableCell className="font-medium text-sm text-foreground">{s.fullName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.email || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.department || '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs transition-all hover:shadow-sm"
                        onClick={() => handleOpenView(s)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-16 text-sm">
                      No staff found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-black dark:text-white">Staff Details</DialogTitle>
            </DialogHeader>
            {activeStaff && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-muted/20 p-6 rounded-lg border border-border mt-2 text-sm">
                <DetailRow label="Employee ID" value={activeStaff.employeeId || '—'} />
                <DetailRow label="Role" value={activeStaff.role?.toString().replace('_', ' ') ?? '—'} />
                <DetailRow label="Name" value={activeStaff.fullName} />
                <DetailRow label="Email" value={activeStaff.email || '—'} />
                <DetailRow label="Phone" value={activeStaff.phone || '—'} />
                <DetailRow label="Department" value={activeStaff.department || '—'} />
                <DetailRow label="Designation" value={activeStaff.designation || '—'} />
                <DetailRow label="Office Location" value={activeStaff.officeLocation || '—'} />
                <DetailRow label="Status" value={activeStaff.status?.toString() ?? '—'} />
                <DetailRow
                  label="Created At"
                  value={activeStaff.createdAt ? new Date(activeStaff.createdAt).toLocaleString() : '—'}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-foreground break-all">{value}</p>
    </div>
  );
}

function PageHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: 'hsl(var(--primary))' }}>
          <span style={{ color: 'hsl(var(--primary-foreground))' }}>{icon}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
