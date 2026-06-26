'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, getErrorMessage, resolveBackendAssetUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DriverDocument } from '@/types';

export function DriverLicensesTab({ driverId }: { driverId: string }) {
  const [licenseDocuments, setLicenseDocuments] = useState<DriverDocument[]>([]);

  const fetchLicenseDocuments = useCallback(async () => {
    try {
      const documents = await apiFetch<DriverDocument[]>(`/api/drivers/${driverId}/documents`);
      setLicenseDocuments(documents.filter((document) => document.entityType === 'LICENSE'));
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  }, [driverId]);

  useEffect(() => {
    void fetchLicenseDocuments();
  }, [fetchLicenseDocuments]);

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Licenses</h3>
      </header>

      <div className="bg-white px-4 py-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Uploaded License Documents</h4>
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
              {doc.fileUrl ? (
                <a href={resolveBackendAssetUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-600">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </a>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  title="Document access link is unavailable"
                  className="h-7 w-7 text-muted-foreground"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              )}
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
