'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { resolveBackendAssetUrl } from '@/lib/api';
import { ExternalLink, FileWarning } from 'lucide-react';

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
}

function isImage(mimeType: string | null | undefined, fileName: string | null | undefined) {
  if (mimeType) return mimeType.startsWith('image/');
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(fileName ?? '');
}

function isPdf(mimeType: string | null | undefined, fileName: string | null | undefined) {
  if (mimeType) return mimeType === 'application/pdf';
  return /\.pdf$/i.test(fileName ?? '');
}

export function DocumentPreviewDialog({ open, onOpenChange, fileUrl, fileName, mimeType }: DocumentPreviewDialogProps) {
  const resolvedUrl = fileUrl ? resolveBackendAssetUrl(fileUrl) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{fileName || 'Document Preview'}</DialogTitle>
        </DialogHeader>

        {!resolvedUrl ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-sm text-muted-foreground">
            <FileWarning className="h-6 w-6" />
            Document access link is unavailable
          </div>
        ) : isImage(mimeType, fileName) ? (
          <img
            src={resolvedUrl}
            alt={fileName || 'Document preview'}
            className="max-h-[70vh] w-full rounded-lg border border-slate-200 object-contain"
          />
        ) : isPdf(mimeType, fileName) ? (
          <iframe
            src={resolvedUrl}
            title={fileName || 'Document preview'}
            className="h-[70vh] w-full rounded-lg border border-slate-200"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 py-12 text-sm text-muted-foreground">
            <FileWarning className="h-6 w-6" />
            Preview not available for this file type.
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
