'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Loader2, Plus, X, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  deleteLeaveRequest,
  getMyLeaveRequests,
  submitLeaveRequest,
  type LeaveRequestItem,
  type LeaveRequestPayload,
} from '@/lib/api/driver-portal';
import { queryKeys } from '@/lib/query-keys';

const LEAVE_TYPES = ['ANNUAL', 'MEDICAL', 'EMERGENCY', 'UNPAID'];
type LeaveFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
const EMPTY_FORM: LeaveRequestPayload = { leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' };
const STATUS_STYLES: Record<string, string> = {
  PENDING: 'border-amber-300 bg-amber-50 text-amber-800',
  APPROVED: 'border-green-300 bg-green-50 text-green-800',
  REJECTED: 'border-red-300 bg-red-50 text-red-800',
  CANCELLED: 'border-slate-300 bg-slate-100 text-slate-700',
};

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 ' +
  'text-sm font-medium text-slate-900 placeholder:text-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 ' +
  'disabled:opacity-60 disabled:bg-slate-50 transition-all duration-200 ' +
  'shadow-sm hover:border-slate-300';

function errorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;
  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === 'string' ? response.data.message : fallback;
}

export default function DriverLeaveRequestsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LeaveRequestPayload>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<LeaveFilter>('ALL');
  const {
    data: requests = [],
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: queryKeys.driverLeaves,
    queryFn: getMyLeaveRequests,
  });

  const counts: Record<LeaveFilter, number> = {
    ALL: requests.length,
    PENDING: requests.filter((r) => (r.status ?? 'PENDING') === 'PENDING').length,
    APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
    REJECTED: requests.filter((r) => r.status === 'REJECTED').length,
  };

  const filteredRequests =
    filter === 'ALL' ? requests : requests.filter((r) => (r.status ?? 'PENDING') === filter);

  useEffect(() => {
    if (error) toast.error(errorMessage(error, 'Failed to load leave requests'));
  }, [error]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const added = await submitLeaveRequest(form);
      queryClient.setQueryData<LeaveRequestItem[]>(queryKeys.driverLeaves, (current = []) => [added, ...current]);
      await queryClient.invalidateQueries({ queryKey: queryKeys.driverLeaves });
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
      queryClient.setQueryData<LeaveRequestItem[]>(queryKeys.driverLeaves, (current = []) => current.filter((r) => r.id !== id));
      await queryClient.invalidateQueries({ queryKey: queryKeys.driverLeaves });
      toast.success('Leave request cancelled');
    } catch (error: unknown) {
      toast.error(errorMessage(error, 'Failed to cancel leave request'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Requests"
        description="Request leave and track its approval status"
        icon={CalendarDays}
      />

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="vfms-card-header flex flex-col gap-4 px-5 py-5 pl-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white">My Leave Requests</CardTitle>
            <p className="mt-1 text-sm text-slate-300">{filteredRequests.length} matching requests</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setForm({ ...EMPTY_FORM })}
                className="bg-amber-400 text-slate-950 hover:bg-amber-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="!max-w-2xl !gap-0 overflow-hidden rounded-xl border-slate-200 !p-0 shadow-2xl sm:!max-w-2xl"
            >
              <DialogHeader className="vfms-form-header flex-row items-center justify-between gap-4 px-8 py-5">
                <div className="relative z-10 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-lg font-bold text-white">Request Leave</DialogTitle>
                </div>
                <button
                  type="button"
                  aria-label="Close leave request form"
                  onClick={() => setOpen(false)}
                  className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </DialogHeader>

              <form onSubmit={submit}>
                <div className="grid gap-5 px-6 py-6">
                  <div className="space-y-2">
                    <label htmlFor="leave-type" className="block text-sm font-semibold text-slate-900">
                      Leave Type <span className="text-red-600">*</span>
                    </label>
                    <Select
                      value={form.leaveType}
                      onValueChange={(value) => setForm((c) => ({ ...c, leaveType: value }))}
                    >
                      <SelectTrigger
                        id="leave-type"
                        className="h-11 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-900 shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      >
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
                    <div className="space-y-2">
                      <label htmlFor="leave-start" className="block text-sm font-semibold text-slate-900">
                        Start Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="leave-start"
                        type="date"
                        required
                        value={form.startDate}
                        onChange={(e) => setForm((c) => ({ ...c, startDate: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="leave-end" className="block text-sm font-semibold text-slate-900">
                        End Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="leave-end"
                        type="date"
                        required
                        min={form.startDate || undefined}
                        value={form.endDate}
                        onChange={(e) => setForm((c) => ({ ...c, endDate: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="leave-reason" className="block text-sm font-semibold text-slate-900">
                      Reason
                    </label>
                    <textarea
                      id="leave-reason"
                      value={form.reason ?? ''}
                      onChange={(e) => setForm((c) => ({ ...c, reason: e.target.value }))}
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 shadow-sm hover:border-slate-300 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 border-t border-slate-100 px-6 pb-6 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 text-white hover:bg-slate-800"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="px-5 py-5">
          <div className="mb-5 flex flex-col gap-2 sm:max-w-xs" aria-label="Filter leave requests by status">
            <Label
              htmlFor="leave-status-filter"
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500"
            >
              Status
            </Label>
            <Select value={filter} onValueChange={(value) => setFilter(value as LeaveFilter)}>
              <SelectTrigger
                id="leave-status-filter"
                className="h-11 rounded-xl border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
              >
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
            <div className="flex justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-muted-foreground">
              <CalendarDays className="mb-3 h-9 w-9 opacity-40" />
              <p>No matching leave requests.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const status = request.status ?? 'PENDING';
                return (
                  <div key={request.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <strong className="text-sm">{(request.leaveType ?? 'ANNUAL').replace(/_/g, ' ')}</strong>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {request.startDate ?? 'Unknown'} — {request.endDate ?? 'Unknown'}
                    </p>
                    {request.reason && <p className="mt-2 text-sm">{request.reason}</p>}
                    {request.approvalNotes && (
                      <p className="mt-2 text-sm text-muted-foreground">Office note: {request.approvalNotes}</p>
                    )}
                    {status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void remove(request.id)}
                        className="mt-3 text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Request
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
