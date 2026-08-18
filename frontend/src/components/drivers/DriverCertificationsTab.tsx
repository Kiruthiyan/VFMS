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
    defaultValues: { certType: undefined },
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
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardHeader className="vfms-card-header flex flex-row items-center justify-between px-4 py-3 pl-8">
        <CardTitle className="text-sm font-semibold text-white">Certifications &amp; Training</CardTitle>
        <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next) { reset(); clearErrors(); } }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 bg-white text-xs">
              <Plus className="h-3.5 w-3.5" /> Add Certification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg overflow-hidden p-0">
            <DialogHeader className="vfms-form-header px-6 py-5 pl-8">
              <DialogTitle className="text-white">Add Certification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-5">
              {formErrorMessages.length > 0 && <FormErrorSummary messages={formErrorMessages} />}
              <div>
                <Label htmlFor="cert-type">Type *</Label>
                <Controller
                  control={control}
                  name="certType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="cert-type" className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus:border-amber-400 focus:ring-amber-400/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {certTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="cert-name">Name *</Label>
                <Input id="cert-name" {...register('certName')} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
              </div>
              <div>
                <Label htmlFor="cert-issuer">Issued By</Label>
                <Input id="cert-issuer" {...register('issuedBy')} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cert-issue-date">Issue Date *</Label>
                  <Input id="cert-issue-date" type="date" {...register('issueDate')} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
                </div>
                <div>
                  <Label htmlFor="cert-expiry-date">Expiry Date</Label>
                  <Input id="cert-expiry-date" type="date" {...register('expiryDate')} className="mt-1 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:border-amber-400 focus-visible:ring-amber-400/40" />
                </div>
              </div>
              <div className="flex pt-2">
                <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl bg-amber-400 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-500">
                  {isSubmitting ? 'Saving...' : 'Add Certification'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-3">
        <div className="space-y-2">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-3 transition-colors"
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor = 'hsl(210 40% 98%)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = '';
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: 'hsl(222 47% 11%)' }}
                >
                  <ShieldCheck className="h-4 w-4" style={{ color: 'hsl(42 100% 50%)' }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{cert.certName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {(cert.certType ?? 'UNKNOWN').replace(/_/g, ' ')}
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
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-muted-foreground">No certifications found</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
