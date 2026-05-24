'use client';
import { useEffect, useState } from 'react';
import api, { apiFetch, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Download, Plus, Trash2, Star, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DriverDocument } from '@/types';
import { FormErrorSummary } from '@/components/forms/FormErrorSummary';

type LicenseCategory = 'A' | 'B' | 'C' | 'CE' | 'D' | 'BE';
type LicenseStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

type DriverLicense = {
  id: number;
  driverId: string;
  driverName: string;
  licenseNumber: string;
  category: LicenseCategory;
  issuingAuthority?: string;
  issueDate: string;
  expiryDate: string;
  documentUrl?: string;
  isPrimary: boolean;
  status: LicenseStatus;
};

type LicenseFormData = {
  licenseNumber: string;
  category: LicenseCategory;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  isPrimary: boolean;
};

const emptyForm: LicenseFormData = {
  licenseNumber: '',
  category: 'B',
  issuingAuthority: '',
  issueDate: '',
  expiryDate: '',
  isPrimary: false,
};

function StatusBadge({ status }: { status: LicenseStatus }) {
  const styleMap: Record<LicenseStatus, string> = {
    VALID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    EXPIRING_SOON: 'bg-amber-100 text-amber-700 border-amber-200',
    EXPIRED: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${styleMap[status]}`}>
      {status}
    </span>
  );
}

export function DriverLicensesTab({ driverId }: { driverId: string }) {
  const [licenses, setLicenses] = useState<DriverLicense[]>([]);
  const [licenseDocuments, setLicenseDocuments] = useState<DriverDocument[]>([]);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<LicenseFormData>(emptyForm);
  const [formError, setFormError] = useState('');

  const fetchLicenses = async () => {
    try {
      const { data } = await api.get<DriverLicense[]>(`/api/drivers/${driverId}/licenses`);
      setLicenses(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const fetchLicenseDocuments = async () => {
    try {
      const documents = await apiFetch<DriverDocument[]>(`/api/drivers/${driverId}/documents`);
      setLicenseDocuments(documents.filter((document) => document.entityType === 'LICENSE'));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    void fetchLicenses();
    void fetchLicenseDocuments();
  }, [driverId]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!form.licenseNumber || !form.issueDate || !form.expiryDate) {
      const message = 'Please fill all required fields';
      setFormError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/drivers/${driverId}/licenses`, {
        ...form,
        driverId,
      });
      toast.success('License added');
      setOpen(false);
      setForm(emptyForm);
      await fetchLicenses();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLicense = async (id: number) => {
    try {
      await api.delete(`/api/drivers/licenses/${id}`);
      toast.success('Deleted');
      await fetchLicenses();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Licenses</h3>
        <Button variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
          <Plus className="h-4 w-4" />
          {open ? 'Close' : 'Add License'}
        </Button>
      </header>

      {open ? (
        <form onSubmit={onSubmit} className="space-y-3 border-b border-gray-200 bg-gray-50 p-4">
          <div>
            <label htmlFor="licenseNumber" className="text-xs text-gray-600">
              License Number *
            </label>
            <input
              id="licenseNumber"
              value={form.licenseNumber}
              onChange={(event) => setForm((prev) => ({ ...prev, licenseNumber: event.target.value }))}
              className="mt-1 h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="category" className="text-xs text-gray-600">
              Category *
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as LicenseCategory }))}
              className="mt-1 h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
            >
              {['A', 'B', 'C', 'CE', 'D', 'BE'].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="issuingAuthority" className="text-xs text-gray-600">
              Issuing Authority
            </label>
            <input
              id="issuingAuthority"
              value={form.issuingAuthority}
              onChange={(event) => setForm((prev) => ({ ...prev, issuingAuthority: event.target.value }))}
              className="mt-1 h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label htmlFor="issueDate" className="text-xs text-gray-600">
                Issue Date *
              </label>
              <input
                id="issueDate"
                type="date"
                value={form.issueDate}
                onChange={(event) => setForm((prev) => ({ ...prev, issueDate: event.target.value }))}
                className="mt-1 h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="expiryDate" className="text-xs text-gray-600">
                Expiry Date *
              </label>
              <input
                id="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(event) => setForm((prev) => ({ ...prev, expiryDate: event.target.value }))}
                className="mt-1 h-9 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(event) => setForm((prev) => ({ ...prev, isPrimary: event.target.checked }))}
              className="h-4 w-4 rounded"
            />
            Primary License
          </label>

            <FormErrorSummary messages={formError ? [formError] : []} />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Saving...' : 'Add License'}
          </Button>
        </form>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50">
              {['Number', 'Category', 'Expiry', 'Primary', 'Status', ''].map((header) => (
                <th key={header} className="px-4 py-2 text-xs font-medium text-gray-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {licenses.map(l => (
              <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 font-mono text-xs text-gray-600">{l.licenseNumber}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex rounded-md border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    {l.category}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{l.expiryDate}</td>
                <td className="px-4 py-2">
                  {l.isPrimary ? (
                    <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-4 py-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void deleteLicense(l.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {licenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-gray-500">
                  No licenses found
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">Uploaded License Documents</h4>
        <div className="space-y-2">
          {licenseDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/15">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900">{doc.fileName}</p>
                  <p className="text-xs text-gray-500">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${doc.fileUrl}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-600">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          ))}
          {licenseDocuments.length === 0 && (
            <p className="py-4 text-center text-sm text-gray-500">No uploaded license documents found</p>
          )}
        </div>
      </div>
    </section>
  );
}
