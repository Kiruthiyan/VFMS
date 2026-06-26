'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Plus, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  deleteLeaveRequest,
  getMyLeaveRequests,
  submitLeaveRequest,
  type LeaveRequestItem,
  type LeaveRequestPayload,
} from '@/lib/api/driver-portal';

const LEAVE_TYPES = ['ANNUAL', 'MEDICAL', 'EMERGENCY', 'UNPAID'];
type LeaveFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
const EMPTY_FORM: LeaveRequestPayload = { leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' };
const STATUS_STYLES: Record<string, string> = {
  PENDING: 'border-amber-300 bg-amber-50 text-amber-800',
  APPROVED: 'border-green-300 bg-green-50 text-green-800',
  REJECTED: 'border-red-300 bg-red-50 text-red-800',
  CANCELLED: 'border-slate-300 bg-slate-100 text-slate-700',
};

function errorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;
  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === 'string' ? response.data.message : fallback;
}

export default function DriverLeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeaveRequestPayload>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<LeaveFilter>('ALL');

  const counts: Record<LeaveFilter, number> = {
    ALL: requests.length,
    PENDING: requests.filter((request) => (request.status ?? 'PENDING') === 'PENDING').length,
    APPROVED: requests.filter((request) => request.status === 'APPROVED').length,
    REJECTED: requests.filter((request) => request.status === 'REJECTED').length,
  };
  const filteredRequests = filter === 'ALL'
    ? requests
    : requests.filter((request) => (request.status ?? 'PENDING') === filter);

  useEffect(() => {
    getMyLeaveRequests()
      .then(setRequests)
      .catch((error) => toast.error(errorMessage(error, 'Failed to load leave requests')))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const added = await submitLeaveRequest(form);
      setRequests((current) => [added, ...current]);
      setForm({ ...EMPTY_FORM });
      setOpen(false);
      toast.success('Leave request submitted');
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to submit leave request'));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await deleteLeaveRequest(id);
      setRequests((current) => current.filter((request) => request.id !== id));
      toast.success('Leave request cancelled');
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to cancel leave request'));
    }
  };

  return (
    <DashboardShell title="Leave Requests" description="Request leave and track its approval status">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-base">My Leave Requests ({filteredRequests.length})</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm({ ...EMPTY_FORM })}><Plus className="mr-2 h-4 w-4" />Request Leave</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Leave</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <select id="leave-type" value={form.leaveType} onChange={(event) => setForm((current) => ({ ...current, leaveType: event.target.value }))} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {LEAVE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><Label htmlFor="leave-start">Start Date</Label><Input id="leave-start" type="date" required value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} className="mt-1" /></div>
                  <div><Label htmlFor="leave-end">End Date</Label><Input id="leave-end" type="date" required min={form.startDate || undefined} value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} className="mt-1" /></div>
                </div>
                <div><Label htmlFor="leave-reason">Reason</Label><Textarea id="leave-reason" value={form.reason ?? ''} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} rows={4} className="mt-1" /></div>
                <Button type="submit" disabled={submitting} className="w-full">{submitting ? 'Submitting...' : 'Submit Request'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-5 flex flex-wrap gap-2" aria-label="Filter leave requests by status">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as LeaveFilter[]).map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={filter === option ? 'default' : 'outline'}
                onClick={() => setFilter(option)}
              >
                {option.charAt(0) + option.slice(1).toLowerCase()} ({counts[option]})
              </Button>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-muted-foreground"><CalendarDays className="mb-3 h-9 w-9 opacity-40" /><p>No matching leave requests.</p></div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const status = request.status ?? 'PENDING';
                return (
                  <div key={request.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <strong className="text-sm">{(request.leaveType ?? 'ANNUAL').replace(/_/g, ' ')}</strong>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}>{status}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{request.startDate ?? 'Unknown'} — {request.endDate ?? 'Unknown'}</p>
                    {request.reason && <p className="mt-2 text-sm">{request.reason}</p>}
                    {request.approvalNotes && <p className="mt-2 text-sm text-muted-foreground">Office note: {request.approvalNotes}</p>}
                    {status === 'PENDING' && <Button variant="outline" size="sm" onClick={() => void remove(request.id)} className="mt-3 text-red-600"><XCircle className="mr-2 h-4 w-4" />Cancel Request</Button>}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
