'use client';

import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { DriverLeave } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Simple header component reused from leaves page
function PageHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

type FilterOption = 'ALL' | 'APPROVED' | 'REJECTED';

export default function LeavesLog() {
  const [leaves, setLeaves] = useState<DriverLeave[]>([]);
  const [filter, setFilter] = useState<FilterOption>('ALL');

  const fetchLeaves = async (status?: FilterOption) => {
    try {
      let url = '/api/drivers/leaves/log';
      if (status && status !== 'ALL') {
        url += `?status=${status}`;
      }
      const data = await apiFetch<DriverLeave[]>(url);
      setLeaves(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchLeaves(filter);
  }, [filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CalendarDays className="w-5 h-5" />}
        title="Leave Requests - Log"
        subtitle="Approved and Rejected leave history"
      />
      <div className="flex items-center space-x-4 mb-4">
        <Select value={filter} onValueChange={(value) => setFilter(value as FilterOption)}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="shadow-sm border-muted">
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
          <CardTitle className="text-sm font-semibold">Leaves ({leaves.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-slate-950 bg-slate-950">
                {['Driver', 'Type', 'From', 'To', 'Reason', 'Status'].map((header) => (
                  <TableHead key={header} className="text-xs font-bold uppercase tracking-[0.18em] text-white">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.map((leave: DriverLeave) => (
                <TableRow key={leave.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium text-sm">
                    {leave.driver?.fullName || '—'}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">{leave.leaveType}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{leave.startDate}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{leave.endDate}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                    {leave.reason || '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={leave.status} />
                  </TableCell>
                </TableRow>
              ))}
              {leaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-16 text-sm">
                    No leave records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
