'use client';

import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { DriverLeave } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeavesLog from '@/components/leaves/LeavesLog';

type Decision = 'APPROVED' | 'REJECTED';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<DriverLeave[]>([]);

  const fetchLeaves = async () => {
    try {
      const data = await apiFetch<DriverLeave[]>('/api/drivers/leaves/pending');
      setLeaves(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      <Tabs defaultValue="pending" className="w-full space-y-6">
        <TabsList className="bg-muted/30 p-1 rounded-lg shadow-sm">
          <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:shadow">
            Leave Requests
          </TabsTrigger>
          <TabsTrigger value="log" className="data-[state=active]:bg-white data-[state=active]:shadow">
            Leave Requests - Log
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <div className="space-y-6">
            <PageHeader
            icon={CalendarDays}
            title="Leave Requests"
            description="Pending driver leave approvals"
          />
          <Card className="shadow-sm border-muted">
            <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
              <CardTitle className="text-sm font-semibold">Pending ({leaves.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-950 bg-slate-950">
                    {['Driver', 'Type', 'From', 'To', 'Reason', 'Status', ''].map((header) => (
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
                      <TableCell>
                        <ProcessLeaveDialog leaveId={leave.id} onProcessed={fetchLeaves} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaves.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-16 text-sm">
                        No pending leave requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="log">
        <LeavesLog />
      </TabsContent>
    </Tabs>
    </div>
  );
}

function ProcessLeaveDialog({
  leaveId,
  onProcessed,
}: {
  leaveId: number;
  onProcessed: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<Decision>('APPROVED');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetAndOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setApprovalStatus('APPROVED');
      setApprovalNotes('');
    }
    setOpen(nextOpen);
  };

  const processLeave = async () => {
    setSubmitting(true);
    try {
      await apiFetch(`/api/drivers/leaves/${leaveId}/process`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: approvalStatus,
          approvalNotes,
        }),
      });

      toast.success('Leave processed');
      setOpen(false);
      onProcessed();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetAndOpen}>
      <DialogTrigger asChild>
        <button
          className="h-7 px-2.5 text-xs rounded-md font-medium border transition-colors"
          style={{
            borderColor: 'hsl(var(--secondary))',
            color: 'hsl(var(--secondary))',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'hsl(var(--secondary))';
            e.currentTarget.style.color = 'hsl(var(--secondary-foreground))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'hsl(var(--secondary))';
          }}
        >
          Process
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl overflow-hidden p-0">
        <DialogHeader className="vfms-form-header px-6 py-5 pl-8">
          <DialogTitle className="text-white">Process Leave Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-6 pb-6 pt-5">
          <div>
            <Label>Decision</Label>
            <Select
              value={approvalStatus}
              onValueChange={(value) => setApprovalStatus(value as Decision)}
            >
              <SelectTrigger className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-400/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPROVED">Approve</SelectItem>
                <SelectItem value="REJECTED">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Input
              value={approvalNotes}
              maxLength={1000}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40"
            />
          </div>
          <div className="flex pt-2">
            <button
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-amber-400 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-500 disabled:opacity-60"
              onClick={() => void processLeave()}
            >
              {submitting ? 'Submitting...' : 'Submit Decision'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
