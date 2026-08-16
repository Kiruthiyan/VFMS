"use client";

import { useDropzone } from "react-dropzone";
import { ExternalLink, FileText, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FleetFileDropzoneProps = {
  title: string;
  optional?: boolean;
  readonly?: boolean;
  file: File | null;
  existingFileName?: string;
  onFileChange: (file: File | null) => void;
  onOpenExisting?: () => void;
  emptyLabel?: string;
  uploadLabel?: string;
  replaceLabel?: string;
};

const ACCEPTED_DOCUMENTS = {
  "application/pdf": [".pdf"],
};

export function FleetFileDropzone({
  title,
  optional,
  readonly,
  file,
  existingFileName,
  onFileChange,
  onOpenExisting,
  emptyLabel = "Drag a PDF file here, or choose a file",
  uploadLabel = "Upload",
  replaceLabel = "Replace",
}: FleetFileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_DOCUMENTS,
    disabled: readonly,
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles) => {
      onFileChange(acceptedFiles[0] ?? null);
    },
  });

  return (
    <div>
      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
        {title}{" "}
        {optional && (
          <span className="text-slate-400 font-normal">(Optional)</span>
        )}
      </label>
      <div
        {...getRootProps()}
        className={cn(
          "rounded-xl p-4 shadow-sm transition-colors",
          readonly
            ? "border border-slate-200 bg-white"
            : "border border-dashed border-slate-300 bg-slate-50/80 hover:border-slate-400 hover:bg-white",
          isDragActive && !readonly && "border-blue-400 bg-blue-50",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-1">
              {title}
            </p>
            {file ? (
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700">
                <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="truncate">{file.name}</span>
              </div>
            ) : existingFileName ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenExisting?.();
                }}
                className="flex min-w-0 max-w-full items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                <span className="truncate">{existingFileName}</span>
              </button>
            ) : (
              <p className="text-sm text-slate-400">
                {isDragActive && !readonly ? "Drop the file here" : emptyLabel}
              </p>
            )}
          </div>

          {!readonly && (
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              {file && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onFileChange(null);
                  }}
                  className="h-9 w-full px-3 sm:w-auto"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  open();
                }}
                className="h-9 w-full bg-white px-3 sm:w-auto"
              >
                <Upload className="h-4 w-4" />
                {file || existingFileName ? replaceLabel : uploadLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
