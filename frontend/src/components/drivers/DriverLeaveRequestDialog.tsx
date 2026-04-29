'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

import { apiFetch, getErrorMessage } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';

type LeaveType = 'ANNUAL' | 'MEDICAL' | 'EMERGENCY' | 'UNPAID';

export function DriverLeaveRequestDialog({ driverId }: { driverId: string }) {
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');

  const requestLeave = async () => {
    setRequestError('');
    if (!startDate || !endDate) {
      const message = 'Start date and end date are required';
      setRequestError(message);
      toast.error(message);
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
      setOpen(false);
      setLeaveType('ANNUAL');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setRequestSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md font-medium"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
          }}
        >
          <CalendarDays className="w-4 h-4" />
          New Leave Request
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Driver Leave Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
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

          <FormErrorSummary messages={requestError ? [requestError] : []} />

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
  );
}
