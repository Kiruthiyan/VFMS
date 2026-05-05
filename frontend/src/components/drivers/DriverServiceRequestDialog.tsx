'use client';

import { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import { toast } from 'sonner';

import { apiFetch } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { Input } from '@/components/ui/input';

type VehicleOption = { id: number };

type RequestFormData = {
  vehicleId?: number;
  requestType: 'FAULT_REPORT' | 'SERVICE_REQUEST' | 'INSPECTION_REQUEST';
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
};

export function DriverServiceRequestDialog({ driverId }: { driverId: string }) {
  const [open, setOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleLoadError, setVehicleLoadError] = useState<string | null>(null);
  const [requestType, setRequestType] = useState<RequestFormData['requestType']>('FAULT_REPORT');
  const [urgency, setUrgency] = useState<RequestFormData['urgency']>('MEDIUM');
  const [description, setDescription] = useState('');
  const [vehicleId, setVehicleId] = useState<number | undefined>(undefined);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    if (!open) return;

    const fetchVehicles = async () => {
      setLoadingVehicles(true);
      setVehicleLoadError(null);
      try {
        const data = await apiFetch<number[]>('/api/vehicles');
        const uniqueIds = Array.from(new Set(data)).sort((a, b) => b - a).map((id) => ({ id }));
        setVehicles(uniqueIds);
        if (uniqueIds.length === 0) {
          setVehicleLoadError('No vehicle IDs found in the database yet.');
        }
      } catch (error) {
        console.error(error);
        setVehicleLoadError('Failed to load vehicle IDs.');
        toast.error('Failed to load vehicle IDs');
        setVehicles([]);
      } finally {
        setLoadingVehicles(false);
      }
    };

    void fetchVehicles();
  }, [open]);

  const submitRequest = async () => {
    setRequestError('');
    if (!String(requestType || '').trim() || !String(description || '').trim()) {
      const message = 'Request type and description are required';
      setRequestError(message);
      toast.error(message);
      return;
    }

    try {
      setRequestSubmitting(true);
      await apiFetch('/api/drivers/service-requests', {
        method: 'POST',
        body: JSON.stringify({
          driverId,
          vehicleId,
          requestType,
          description,
          urgency,
        }),
      });

      toast.success('Submitted');
      setOpen(false);
      setRequestType('FAULT_REPORT');
      setUrgency('MEDIUM');
      setDescription('');
      setVehicleId(undefined);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit request');
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
          <Wrench className="w-4 h-4" />
          New Service Request
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Driver Service Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Vehicle ID</Label>
              <Select
                onValueChange={(value) => setVehicleId(value ? Number(value) : undefined)}
                value={vehicleId ? String(vehicleId) : undefined}
                disabled={loadingVehicles}
              >
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue placeholder={loadingVehicles ? 'Loading vehicle IDs...' : 'Select vehicle ID'} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                      Vehicle #{vehicle.id}
                    </SelectItem>
                  ))}
                  {!loadingVehicles && vehicles.length === 0 && (
                    <SelectItem value="no-vehicles" disabled>
                      {vehicleLoadError || 'No vehicle IDs available'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Request Type *</Label>
              <Select value={requestType} onValueChange={(value) => setRequestType(value as RequestFormData['requestType'])}>
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['FAULT_REPORT', 'SERVICE_REQUEST', 'INSPECTION_REQUEST'].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Urgency</Label>
            <Select value={urgency} onValueChange={(value) => setUrgency(value as RequestFormData['urgency'])}>
              <SelectTrigger className="mt-1 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['LOW', 'MEDIUM', 'HIGH'].map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Description *</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 h-9 text-sm" />
          </div>
          <FormErrorSummary messages={requestError ? [requestError] : []} />
          <button
            className="w-full h-9 rounded-md text-sm font-medium disabled:opacity-50"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
            }}
            disabled={requestSubmitting}
            onClick={submitRequest}
          >
            {requestSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
