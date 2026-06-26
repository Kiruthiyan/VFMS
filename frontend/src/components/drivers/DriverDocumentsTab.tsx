'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { apiFetch, resolveBackendAssetUrl } from '@/lib/api';
import { DriverDocument } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DriverDocumentsTab({ driverId }: { driverId: string }) {
  const [documents, setDocuments] = useState<DriverDocument[]>([]);

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
        <CardTitle className="text-sm font-semibold">Other Documents</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4 pt-3">
        <div className="space-y-1.5">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-border p-2.5 transition-colors hover:bg-muted/20"
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
            <p className="py-4 text-center text-xs text-muted-foreground">No other documents uploaded</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
