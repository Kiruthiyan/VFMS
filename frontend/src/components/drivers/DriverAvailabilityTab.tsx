'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetch } from '@/lib/api';
import { AvailabilityStatus, DriverAvailability } from '@/types';

const AVAILABILITY_STATUSES: AvailabilityStatus[] = [
  'AVAILABLE',
  'ON_TRIP',
  'ON_LEAVE',
  'INACTIVE',
];

export function DriverAvailabilityTab({
  driverId,
}: {
  driverId: string;
}) {
  const [availability, setAvailability] = useState<DriverAvailability | null>(null);
  const [newStatus, setNewStatus] = useState<AvailabilityStatus>('AVAILABLE');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAvailability = () =>
    apiFetch<DriverAvailability>(`/api/drivers/${driverId}/availability`)
      .then(setAvailability)
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    fetchAvailability();
  }, [driverId]);

  const updateStatus = async () => {
    setLoading(true);

    try {
      await apiFetch(`/api/drivers/${driverId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, reason }),
        headers: { 'X-User-Id': 'ADMIN' },
      });
      toast.success('Updated');
      fetchAvailability();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
          <CardTitle className="text-sm font-semibold">Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4 pb-4 pt-3">
          {availability ? (
            <>
              <StatusBadge status={availability.status} />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock
                  className="h-3.5 w-3.5"
                  style={{ color: 'hsl(var(--primary))' }}
                />
                Updated {new Date(availability.updatedAt).toLocaleString()}
              </div>
              {availability.reason && (
                <p className="text-xs text-muted-foreground">
                  Reason: {availability.reason}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border bg-muted/30 px-4 py-3">
          <CardTitle className="text-sm font-semibold">Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 pt-3">
          <div>
            <Label className="text-xs text-muted-foreground">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as AvailabilityStatus)}
            >
              <SelectTrigger className="mt-1 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Reason</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional..."
              className="mt-1 h-9 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={updateStatus}
            disabled={loading}
            className="h-9 w-full rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
          >
            {loading ? 'Updating...' : 'Update Availability'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
