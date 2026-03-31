'use client';

import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { apiFetch } from '@/lib/api';
import { DriverDocument } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function DriverDocumentsTab({ driverId }: { driverId: string }) {
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [entityType, setEntityType] = useState<DriverDocument['entityType']>('OTHER');
  const [uploading, setUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchDocuments = useCallback(() => {
    apiFetch<DriverDocument[]>(`/api/drivers/${driverId}/documents`)
      .then(setDocuments)
      .catch((e) => toast.error(e.message));
  }, [driverId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const validFiles = files.filter((file) => allowedTypes.includes(file.type));

      if (validFiles.length !== files.length) {
        toast.error('Only PDF, JPG, and PNG files are allowed.');
      }
      if (!validFiles.length) return;

      setUploading(true);
      const token = localStorage.getItem('token');

      try {
        for (const file of validFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('entityType', entityType);

          const res = await fetch(`${API_BASE}/api/drivers/${driverId}/documents`, {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
          });

          if (!res.ok) {
            throw new Error('Upload failed');
          }

          toast.success(`${file.name} uploaded`);
        }

        fetchDocuments();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [driverId, entityType, fetchDocuments]
  );

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files ? Array.from(event.target.files) : [];
    void uploadFiles(selected);
    event.target.value = '';
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const droppedFiles = Array.from(event.dataTransfer.files ?? []);
    void uploadFiles(droppedFiles);
  };

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
        <CardTitle className="text-sm font-semibold">Documents</CardTitle>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Type:</Label>
          <Select value={entityType} onValueChange={(value) => setEntityType(value as DriverDocument['entityType'])}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['LICENSE', 'CERTIFICATION', 'PROFILE', 'OTHER'].map((type) => (
                <SelectItem key={type} value={type} className="text-xs">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4 pt-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className="cursor-pointer rounded-lg border-2 border-dashed border-amber-400 p-6 text-center transition-colors"
          style={{ backgroundColor: isDragActive ? 'hsl(42 100% 50% / 0.05)' : '' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={onInputChange}
          />
          <Upload className="mx-auto mb-2 h-7 w-7 fill-amber-500 text-amber-600" />
          <p className="text-sm text-muted-foreground">{isDragActive ? 'Drop files here...' : 'Drag and drop or click to upload'}</p>
          <p className="mt-1 text-xs text-muted-foreground opacity-60">PDF, JPG, PNG · Max 10MB</p>
          {uploading && <p className="mt-2 text-xs font-medium text-amber-600">Uploading...</p>}
        </div>

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
                  <p className="text-xs font-medium text-foreground">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.entityType} · {(doc.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                <a href={`${API_BASE}${doc.fileUrl}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-600">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </a>
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

          {documents.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No documents uploaded</p>}
        </div>
      </CardContent>
    </Card>
  );
}
