'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const requestSchema = z.object({
  staffId: z.coerce.number().min(1),
  vehicleId: z.coerce.number().optional(),
  requestType: z.enum(['FAULT_REPORT', 'SERVICE_REQUEST', 'INSPECTION_REQUEST']),
  description: z.string().min(1),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface ServiceRequest {
  id: number;
  staff: unknown;
  vehicleId?: number;
  requestType: string;
  description: string;
  urgency: string;
  status: string;
  createdAt: string;
}

const urgencyLeftBorder: Record<string, string> = {
  LOW: 'hsl(var(--success))',
  MEDIUM: 'hsl(var(--warning))',
  HIGH: 'hsl(var(--secondary))',
};

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { urgency: 'MEDIUM', requestType: 'FAULT_REPORT' },
  });

  const fetchRequests = () =>
    apiFetch<ServiceRequest[]>('/api/staff/service-requests/open')
      .then(setRequests)
      .catch((e: Error) => toast.error(e.message));

  useEffect(() => {
    fetchRequests();
  }, []);

  const onSubmit = async (data: RequestFormData) => {
    try {
      await apiFetch('/api/staff/service-requests', {
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
      await apiFetch(`/api/staff/service-requests/${id}/status?status=${status}`, { method: 'PATCH' });
      fetchRequests();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        icon={<Wrench className="w-5 h-5" />}
        title="Service Requests"
        subtitle="Vehicle fault & maintenance requests"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md font-medium"
                style={{
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                }}
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Service Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Staff ID *</Label>
                    <Input type="number" {...register('staffId')} className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Vehicle ID</Label>
                    <Input type="number" {...register('vehicleId')} className="mt-1 h-9 text-sm" />
                  </div>
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
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-9 rounded-md text-sm font-medium disabled:opacity-50"
                  style={{
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </DialogContent>
          </Dialog>
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
                    {req.urgency === 'HIGH' && (
                      <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'hsl(var(--secondary))' }} />
                    )}
                    <span className="text-sm font-medium text-foreground">{req.requestType.replace(/_/g, ' ')}</span>
                    <StatusBadge status={req.urgency} />
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{req.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-border"
                    onClick={() => updateStatus(req.id, 'ACKNOWLEDGED')}
                  >
                    Acknowledge
                  </Button>
                  <button
                    className="h-7 px-3 text-xs rounded-md font-medium"
                    style={{
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                    }}
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
