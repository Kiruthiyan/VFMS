'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { ControllerRenderProps } from 'react-hook-form';
import { apiFetch } from '@/lib/api';
import { DriverInfraction } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';

type InfractionFormData = {
  infractionType: 'TRAFFIC_VIOLATION' | 'MINOR_ACCIDENT' | 'MAJOR_ACCIDENT' | 'NEAR_MISS' | 'RECKLESS_DRIVING' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  incidentDate: string;
  description?: string;
  penaltyNotes?: string;
};

export function DriverInfractionsTab({ driverId }: { driverId: string }) {
  const [infractions, setInfractions] = useState<DriverInfraction[]>([]);
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    control,
    register,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<InfractionFormData>({
    defaultValues: { infractionType: 'TRAFFIC_VIOLATION', severity: 'LOW' },
  });

  const formErrorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message));

  const fetchInfractions = async () => {
    try {
      const data = await apiFetch<DriverInfraction[]>(`/api/drivers/${driverId}/infractions`);
      setInfractions(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch infractions');
    }
  };

  useEffect(() => {
    void fetchInfractions();
  }, [driverId]);

  const onSubmit = async (data: InfractionFormData) => {
    clearErrors();
    const missingFields: Array<keyof InfractionFormData> = [];
    if (!String(data.infractionType || '').trim()) missingFields.push('infractionType');
    if (!String(data.severity || '').trim()) missingFields.push('severity');
    if (!String(data.incidentDate || '').trim()) missingFields.push('incidentDate');

    missingFields.forEach((field) => setError(field, { type: 'manual', message: 'Required' }));
    if (missingFields.length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      await apiFetch('/api/drivers/infractions', {
        method: 'POST',
        body: JSON.stringify({ ...data, driverId }),
      });
      toast.success('Logged');
      setOpen(false);
      reset();
      await fetchInfractions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to log infraction');
    }
  };

  const resolve = async (id: number) => {
    try {
      await apiFetch(`/api/drivers/infractions/${id}/resolve`, { method: 'PATCH' });
      toast.success('Resolved');
      await fetchInfractions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resolve infraction');
    }
  };

  // Left border uses CSS variable tokens
  const severityLeftBorder: Record<string, string> = {
    LOW: 'hsl(var(--success))',
    MEDIUM: 'hsl(var(--warning))',
    HIGH: 'hsl(var(--secondary))',
    CRITICAL: 'hsl(var(--destructive))',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <CardTitle className="text-sm font-semibold">Infractions & Incidents</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors"
              style={{
                backgroundColor: 'hsl(var(--secondary))',
                color: 'hsl(var(--secondary-foreground))',
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Log Infraction
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Infraction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Type *</Label>
                <Controller
                  name="infractionType"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<InfractionFormData, 'infractionType'> }) => (
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1 h-9 text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'TRAFFIC_VIOLATION',
                          'MINOR_ACCIDENT',
                          'MAJOR_ACCIDENT',
                          'NEAR_MISS',
                          'RECKLESS_DRIVING',
                          'OTHER',
                        ].map((t) => (
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
                <Label className="text-xs text-muted-foreground">Severity *</Label>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }: { field: ControllerRenderProps<InfractionFormData, 'severity'> }) => (
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1 h-9 text-sm">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Incident Date *</Label>
                <Input type="date" {...register('incidentDate')} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Input {...register('description')} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Penalty Notes</Label>
                <Input {...register('penaltyNotes')} className="mt-1 h-9 text-sm" />
              </div>
              <FormErrorSummary messages={formErrorMessages} />
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 w-full rounded-md text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: 'hsl(var(--secondary))',
                  color: 'hsl(var(--secondary-foreground))',
                }}
              >
                {isSubmitting ? 'Saving...' : 'Log Infraction'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-3">
        <div className="space-y-2">
          {infractions.map((inf: DriverInfraction) => (
            <div
              key={inf.id}
              className="rounded-lg border border-border bg-card p-3"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: severityLeftBorder[inf.severity] || 'hsl(var(--border))',
                borderLeftStyle: 'solid',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {inf.infractionType.replace(/_/g, ' ')}
                    </span>
                    <StatusBadge status={inf.severity} />
                    <StatusBadge status={inf.resolutionStatus} />
                  </div>
                  <p className="text-xs text-muted-foreground">{inf.incidentDate}</p>
                  {inf.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{inf.description}</p>
                  )}
                </div>
                {inf.resolutionStatus !== 'RESOLVED' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    style={{ color: 'hsl(var(--success))' }}
                    onClick={() => void resolve(inf.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {infractions.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No infractions recorded</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
