'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Controller, useForm } from 'react-hook-form';
import { AlertTriangle, Plus, Wrench } from 'lucide-react';
import { toast } from 'sonner';

import { apiFetch } from '@/lib/api';
import { Driver, PageResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';

type RequestFormData = {
  driverId?: string;
  vehicleId?: number;
  requestType: 'FAULT_REPORT' | 'SERVICE_REQUEST' | 'INSPECTION_REQUEST';
  description: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
};

type VehicleOption = { id: number };

type DriverServiceRequest = {
  id: number;
  vehicleId?: number;
  requestType: string;
  description: string;
  urgency: string;
  status: string;
  createdAt: string;
};

const urgencyLeftBorder: Record<string, string> = {
  LOW: 'hsl(var(--success))',
  MEDIUM: 'hsl(var(--warning))',
  HIGH: 'hsl(var(--secondary))',
};

export default function DriverServiceRequestsPage() {
  const [requests, setRequests] = useState<DriverServiceRequest[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleLoadError, setVehicleLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({ defaultValues: { urgency: 'MEDIUM', requestType: 'FAULT_REPORT' } });

  const formErrorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message));

  const fetchRequests = () =>
    apiFetch<DriverServiceRequest[]>('/api/drivers/service-requests/open')
      .then(setRequests)
      .catch((e: Error) => toast.error(e.message));

  const fetchDrivers = () =>
    apiFetch<PageResponse<Driver>>('/api/drivers?page=0&size=200')
      .then((data) => setDrivers(data.content.filter((driver) => driver.status === 'ACTIVE')))
      .catch((e: Error) => toast.error(e.message));

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

  useEffect(() => {
    fetchRequests();
    fetchDrivers();
    void fetchVehicles();
  }, []);

  const onSubmit = async (data: RequestFormData) => {
    clearErrors();
    const missingFields: Array<keyof RequestFormData> = [];
    if (!data.driverId) missingFields.push('driverId');
    if (!String(data.requestType || '').trim()) missingFields.push('requestType');
    if (!String(data.description || '').trim()) missingFields.push('description');

    missingFields.forEach((field) => setError(field, { type: 'manual', message: 'Required' }));
    if (missingFields.length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      await apiFetch('/api/drivers/service-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast.success('Submitted');
      setOpen(false);
      reset();
      fetchRequests();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to submit request');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiFetch(`/api/drivers/service-requests/${id}/status?status=${status}`, { method: 'PATCH' });
      fetchRequests();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        icon={<Wrench className="w-5 h-5" />}
        title="Driver Service Requests"
        subtitle="Request maintenance or fault follow-up for a selected driver"
        action={
          <div className="flex items-center gap-2">
            <Link href="/drivers" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-muted transition-colors">
              Back
            </Link>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md font-medium"
                  style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                >
                  <Plus className="w-4 h-4" />
                  New Request
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Driver Service Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Driver ID *</Label>
                      <Controller
                        name="driverId"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-1 h-9 text-sm">
                              <SelectValue placeholder="Select driver" />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers.map((driver) => (
                                <SelectItem key={driver.id} value={driver.id}>
                                  {driver.employeeId} - {driver.firstName} {driver.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vehicle ID</Label>
                      <Controller
                        name="vehicleId"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={(value) => field.onChange(value ? Number(value) : undefined)} value={field.value ? String(field.value) : undefined} disabled={loadingVehicles}>
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
                        )}
                      />
                    </div>
                    {vehicleLoadError && vehicles.length === 0 && (
                      <p className="col-span-2 text-xs text-muted-foreground">{vehicleLoadError}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Request Type *</Label>
                    <Controller
                      name="requestType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Urgency</Label>
                    <Controller
                      name="urgency"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      )}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Description *</Label>
                    <Input {...register('description')} className="mt-1 h-9 text-sm" />
                  </div>
                  <FormErrorSummary messages={formErrorMessages} />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-9 rounded-md text-sm font-medium disabled:opacity-50"
                    style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="space-y-2.5">
        {requests.map((req) => (
          <Card
            key={req.id}
            style={{
              borderLeftWidth: 4,
              borderLeftStyle: 'solid',
              borderLeftColor: urgencyLeftBorder[req.urgency] || 'hsl(var(--border))',
            }}
          >
            <CardContent className="py-3 px-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {req.urgency === 'HIGH' && <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'hsl(var(--secondary))' }} />}
                    <span className="text-sm font-medium text-foreground">{req.requestType.replace(/_/g, ' ')}</span>
                    <StatusBadge status={req.urgency} />
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{req.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  <Button variant="outline" size="sm" className="h-7 text-xs border-border" onClick={() => updateStatus(req.id, 'ACKNOWLEDGED')}>
                    Acknowledge
                  </Button>
                  <button
                    className="h-7 px-3 text-xs rounded-md font-medium"
                    style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                    onClick={() => updateStatus(req.id, 'RESOLVED')}
                  >
                    Resolve
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && (
          <Card>
            <CardContent className="text-center text-muted-foreground py-16 text-sm">No open requests</CardContent>
          </Card>
        )}
      </div>
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
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg p-2" style={{ backgroundColor: 'hsl(42 100% 50% / 0.12)' }}>
          {icon}
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
