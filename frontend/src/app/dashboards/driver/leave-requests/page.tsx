'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Plus, X, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="vfms-card-header flex flex-col gap-4 px-5 py-5 pl-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white">My Leave Requests</CardTitle>
            <p className="mt-1 text-sm text-slate-300">{filteredRequests.length} matching requests</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm({ ...EMPTY_FORM })} className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                <Plus className="mr-2 h-4 w-4" />Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="!max-w-2xl !gap-0 overflow-hidden rounded-2xl border-slate-200 !p-0 shadow-2xl sm:!max-w-2xl">
              <DialogHeader className="vfms-form-header flex-row items-center justify-between gap-4 px-6 py-5 pl-8">
                <DialogTitle className="text-white">Request Leave</DialogTitle>
                <button
                  type="button"
                  aria-label="Close leave request form"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogHeader>
              <form onSubmit={submit}>
                <div className="grid gap-4 px-6 py-6">
                <div>
                  <Label htmlFor="leave-type" className="mb-2 block text-sm font-semibold text-slate-700">Leave Type</Label>
                  <Select value={form.leaveType} onValueChange={(value) => setForm((current) => ({ ...current, leaveType: value }))}>
                    <SelectTrigger id="leave-type" className="h-11 rounded-lg border-slate-300 bg-white text-sm font-medium text-slate-950 shadow-sm focus:ring-4 focus:ring-slate-100">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAVE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div><Label htmlFor="leave-start" className="mb-2 block text-sm font-semibold text-slate-700">Start Date</Label><Input id="leave-start" type="date" required value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} className="h-11 rounded-lg border-slate-300 text-sm font-medium shadow-sm focus:border-slate-500 focus:ring-4 focus:ring-slate-100" /></div>
                  <div><Label htmlFor="leave-end" className="mb-2 block text-sm font-semibold text-slate-700">End Date</Label><Input id="leave-end" type="date" required min={form.startDate || undefined} value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} className="h-11 rounded-lg border-slate-300 text-sm font-medium shadow-sm focus:border-slate-500 focus:ring-4 focus:ring-slate-100" /></div>
                </div>
                <div><Label htmlFor="leave-reason" className="mb-2 block text-sm font-semibold text-slate-700">Reason</Label><Textarea id="leave-reason" value={form.reason ?? ''} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} rows={4} className="rounded-lg border-slate-300 text-sm shadow-sm focus:border-slate-500 focus:ring-4 focus:ring-slate-100" /></div>
                </div>
                <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-5 py-5">
          <div className="mb-5 flex flex-col gap-2 sm:max-w-xs" aria-label="Filter leave requests by status">
            <Label htmlFor="leave-status-filter" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Status
            </Label>
            <Select value={filter} onValueChange={(value) => setFilter(value as LeaveFilter)}>
              <SelectTrigger id="leave-status-filter" className="h-11 rounded-2xl bg-white text-slate-900">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as LeaveFilter[]).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0) + option.slice(1).toLowerCase()} ({counts[option]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading ? (
            <div className="flex justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-muted-foreground"><CalendarDays className="mb-3 h-9 w-9 opacity-40" /><p>No matching leave requests.</p></div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const status = request.status ?? 'PENDING';
                return (
                  <div key={request.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
