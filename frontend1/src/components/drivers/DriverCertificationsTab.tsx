'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { apiFetch } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';

type CertificationType =
  | 'DEFENSIVE_DRIVING'
  | 'FIRST_AID'
  | 'HAZMAT'
  | 'HEAVY_VEHICLE'
  | 'PASSENGER_TRANSPORT'
  | 'OTHER';

type CertStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

type DriverCertification = {
  id: number;
  certType: CertificationType;
  certName: string;
  issuedBy?: string;
  issueDate: string;
  expiryDate?: string;
  documentUrl?: string;
  status: CertStatus;
};

const certTypes: CertificationType[] = [
  'DEFENSIVE_DRIVING',
  'FIRST_AID',
  'HAZMAT',
  'HEAVY_VEHICLE',
  'PASSENGER_TRANSPORT',
  'OTHER',
];

type CertFormData = {
  certType: CertificationType;
  certName: string;
  issuedBy?: string;
  issueDate: string;
  expiryDate?: string;
};

export function DriverCertificationsTab({ driverId }: { driverId: string }) {
  const [certs, setCerts] = useState<DriverCertification[]>([]);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CertFormData>({
    defaultValues: { certType: 'DEFENSIVE_DRIVING' },
  });

  const formErrorMessages = Object.values(errors)
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message));

  const fetchCerts = () =>
    apiFetch<DriverCertification[]>(`/api/drivers/${driverId}/certifications`)
      .then(setCerts)
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to load certifications';
        toast.error(message);
      });

  useEffect(() => {
    void fetchCerts();
  }, [driverId]);

  const onSubmit = async (data: CertFormData) => {
    clearErrors();
    const missingFields: Array<keyof CertFormData> = [];
    if (!String(data.certType || '').trim()) missingFields.push('certType');
    if (!String(data.certName || '').trim()) missingFields.push('certName');
    if (!String(data.issueDate || '').trim()) missingFields.push('issueDate');

    missingFields.forEach((field) => setError(field, { type: 'manual', message: 'Required' }));
    if (missingFields.length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    try {
      await apiFetch(`/api/drivers/${driverId}/certifications`, {
        method: 'POST',
        body: JSON.stringify({ ...data, driverId }),
      });
      toast.success('Added');
      setOpen(false);
      reset();
      await fetchCerts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add certification';
      toast.error(message);
    }
  };

  const deleteCert = async (id: number) => {
    try {
      await apiFetch(`/api/drivers/certifications/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      await fetchCerts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete certification';
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <CardTitle className="text-sm font-semibold">Certifications &amp; Training</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors"
              style={{
                borderColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary))',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = 'hsl(var(--primary))';
                event.currentTarget.style.color = 'hsl(var(--primary-foreground))';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = 'transparent';
                event.currentTarget.style.color = 'hsl(var(--primary))';
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Certification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Type *</Label>
                <Controller
                  name="certType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="mt-1 h-9 text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {certTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Certificate Name *</Label>
                <Input {...register('certName')} className="mt-1 h-9 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Issued By</Label>
                <Input {...register('issuedBy')} className="mt-1 h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Issue Date *</Label>
                  <Input type="date" {...register('issueDate')} className="mt-1 h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Expiry Date</Label>
                  <Input type="date" {...register('expiryDate')} className="mt-1 h-9 text-sm" />
                </div>
              </div>
              <FormErrorSummary messages={formErrorMessages} />
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-9 w-full rounded-md text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                }}
              >
                {isSubmitting ? 'Saving...' : 'Add Certification'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-3">
        <div className="space-y-2">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="flex items-start justify-between rounded-lg border border-border p-3 transition-colors"
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = 'hsl(42 100% 50% / 0.05)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = '';
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: 'hsl(var(--primary))' }}
                >
                  <ShieldCheck className="h-4 w-4" style={{ color: 'hsl(var(--primary-foreground))' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{cert.certName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cert.certType.replace(/_/g, ' ')}
                    {cert.issuedBy ? ` · ${cert.issuedBy}` : ''}
                  </p>
                  {cert.expiryDate ? (
                    <p className="text-xs text-muted-foreground">Expires: {cert.expiryDate}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={cert.status} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onMouseEnter={(event) => {
                    event.currentTarget.style.color = 'hsl(var(--destructive))';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.color = '';
                  }}
                  onClick={() => void deleteCert(cert.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {certs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No certifications found</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
