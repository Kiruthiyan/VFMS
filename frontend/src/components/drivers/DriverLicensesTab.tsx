'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DriverDocument } from '@/types';
import { DocumentPreviewDialog } from './DocumentPreviewDialog';

export function DriverLicensesTab({ driverId }: { driverId: string }) {
  const [licenseDocuments, setLicenseDocuments] = useState<DriverDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<DriverDocument | null>(null);

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
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="vfms-card-header flex items-center justify-between px-4 py-3 pl-8">
        <h3 className="text-sm font-semibold text-white">Licenses</h3>
      </header>

      <div className="bg-white px-4 py-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Uploaded License Documents</h4>
        <div className="space-y-2">
          {licenseDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/15">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-950">{doc.fileName}</p>
                  <p className="text-xs text-slate-500">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              {doc.fileUrl ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-amber-600"
                  onClick={() => setPreviewDoc(doc)}
                  title="Preview document"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled
                  title="Document access link is unavailable"
                  className="h-7 w-7 text-muted-foreground"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
          {licenseDocuments.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-center text-sm text-slate-500">No uploaded license documents found</p>
          )}
        </div>
      </div>

      <DocumentPreviewDialog
        open={!!previewDoc}
        onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}
        fileUrl={previewDoc?.fileUrl}
        fileName={previewDoc?.fileName}
        mimeType={previewDoc?.mimeType}
      />
    </section>
  );
}
