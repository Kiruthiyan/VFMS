'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { Driver, DriverLeave, PageResponse } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Decision = 'APPROVED' | 'REJECTED';
type LeaveType = 'ANNUAL' | 'MEDICAL' | 'EMERGENCY' | 'UNPAID';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<DriverLeave[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<Decision>('APPROVED');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [driverId, setDriverId] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      const data = await apiFetch<DriverLeave[]>('/api/drivers/leaves/pending');
      setLeaves(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await apiFetch<PageResponse<Driver>>('/api/drivers?page=0&size=500');
      setDrivers(data.content);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchDrivers();
  }, []);

  const processLeave = async (id: number) => {
    try {
      await apiFetch(`/api/drivers/leaves/${id}/process`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: approvalStatus,
          approvalNotes,
        }),
        headers: {
          'X-User-Id': 'ADMIN',
        },
      });

      toast.success('Leave processed');
      setApprovalNotes('');
      setApprovalStatus('APPROVED');
      fetchLeaves();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const requestLeave = async () => {
    if (!driverId || !startDate || !endDate) {
      toast.error('Driver ID, start date and end date are required');
      return;
    }

    try {
      setRequestSubmitting(true);
      await apiFetch('/api/drivers/leaves', {
        method: 'POST',
        body: JSON.stringify({
          driverId,
          leaveType,
          startDate,
          endDate,
          reason,
        }),
      });

      toast.success('Leave request submitted');
      setRequestOpen(false);
      setDriverId('');
      setLeaveType('ANNUAL');
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchLeaves();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setRequestSubmitting(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        icon={<CalendarDays className="w-5 h-5" />}
        title="Leave Requests"
        subtitle="Pending driver leave approvals"
        action={
          <div className="flex items-center gap-2">
            <Link href="/drivers" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-muted transition-colors">
              Back
            </Link>

            <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
              <DialogTrigger asChild>
                <button
                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium"
                  style={{
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  New Leave Request
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Driver Leave Request</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 pt-1">
                  <div>
                    <Label className="text-xs text-muted-foreground">Driver</Label>
                    <Select value={driverId} onValueChange={setDriverId}>
                      <SelectTrigger className="mt-1 h-9 text-sm">
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.firstName} {driver.lastName} · {driver.employeeId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Leave Type</Label>
                    <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)}>
                      <SelectTrigger className="mt-1 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {['ANNUAL', 'MEDICAL', 'EMERGENCY', 'UNPAID'].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">End Date</Label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 h-9 text-sm" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Reason</Label>
                    <Input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 h-9 text-sm" />
                  </div>

                  <button
                    className="h-9 w-full rounded-md text-sm font-medium disabled:opacity-50"
                    style={{
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                    }}
                    disabled={requestSubmitting}
                    onClick={requestLeave}
                  >
                    {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardHeader className="py-3 px-4 border-b border-border bg-muted/30">
          <CardTitle className="text-sm font-semibold">Pending ({leaves.length})</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/40">
                {['Driver', 'Type', 'From', 'To', 'Reason', 'Status', ''].map((header) => (
                  <TableHead key={header} className="text-xs font-medium text-muted-foreground">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {leaves.map((leave: DriverLeave) => (
                <TableRow key={leave.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium text-sm">
                    {leave.driver.firstName} {leave.driver.lastName}
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
                    <Dialog>
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

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Process Leave Request</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-3 pt-1">
                          <div>
                            <Label className="text-xs text-muted-foreground">Decision</Label>
                            <Select value={approvalStatus} onValueChange={(value) => setApprovalStatus(value as Decision)}>
                              <SelectTrigger className="mt-1 h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="APPROVED">Approve</SelectItem>
                                <SelectItem value="REJECTED">Reject</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs text-muted-foreground">Notes</Label>
                            <Input
                              value={approvalNotes}
                              onChange={(e: { target: { value: string } }) => setApprovalNotes(e.target.value)}
                              className="mt-1 h-9 text-sm"
                            />
                          </div>

                          <button
                            className="w-full h-9 rounded-md text-sm font-medium"
                            style={{
                              backgroundColor: 'hsl(var(--primary))',
                              color: 'hsl(var(--primary-foreground))',
                            }}
                            onClick={() => processLeave(leave.id)}
                          >
                            Submit Decision
                          </button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
  );
}

function PageHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'hsl(var(--primary))' }}>
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
