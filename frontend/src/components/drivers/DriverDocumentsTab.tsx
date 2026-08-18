'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { apiFetch } from '@/lib/api';
import { DriverDocument } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentPreviewDialog } from './DocumentPreviewDialog';

export function DriverDocumentsTab({ driverId }: { driverId: string }) {
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<DriverDocument | null>(null);

  const fetchDocuments = useCallback(() => {
    apiFetch<DriverDocument[]>(`/api/drivers/${driverId}/documents`)
      .then((items) => setDocuments(items.filter((document) => document.entityType === 'OTHER')))
      .catch((e) => toast.error(e.message));
  }, [driverId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const deleteDocument = async (id: number) => {
    try {
      await apiFetch(`/api/drivers/documents/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      fetchDocuments();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardHeader className="vfms-card-header flex flex-row items-center justify-between px-4 py-3 pl-8">
        <CardTitle className="text-sm font-semibold text-white">Other Documents</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4 pt-3">
        <div className="space-y-1.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-amber-500/15">
                  <FileText className="h-4 w-4 fill-amber-500 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{doc.fileName || 'Other document'}</p>
                  <p className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <div className="flex gap-1">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-600"
                  onClick={() => deleteDocument(doc.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {documents.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-4 text-center text-xs text-muted-foreground">No other documents uploaded</p>
          )}
        </div>
      </CardContent>

      <DocumentPreviewDialog
        open={!!previewDoc}
        onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}
        fileUrl={previewDoc?.fileUrl}
        fileName={previewDoc?.fileName}
        mimeType={previewDoc?.mimeType}
      />
    </Card>
  );
}
