"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, X, FileText, AlertTriangle } from "lucide-react";

import {
  fuelEntrySchema,
  type FuelEntryFormValues,
} from "@/lib/validators/fuel/fuel-entry-schema";
import { createFuelRecordApi, getErrorMessage } from "@/lib/api/fuel";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { Alert } from "@/components/ui/alert";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 " +
  "text-sm text-slate-100 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-500/60 " +
  "focus:border-amber-500/60 disabled:opacity-50 transition-colors";

interface FuelEntryFormProps {
  vehicles: { id: string; label: string }[];
  drivers: { id: string; label: string }[];
  onSuccess?: () => void;
}

export function FuelEntryForm({
  vehicles,
  drivers,
  onSuccess,
}: FuelEntryFormProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [flagWarning, setFlagWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FuelEntryFormValues>({
    resolver: zodResolver(fuelEntrySchema),
    defaultValues: { fuelDate: new Date().toISOString().split("T")[0] },
  });

  const quantity = watch("quantity");
  const costPerLitre = watch("costPerLitre");
  const estimatedTotal =
    quantity && costPerLitre
      ? (Number(quantity) * Number(costPerLitre)).toFixed(2)
      : null;

  // Receipt dropzone
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setReceiptFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const onSubmit = async (data: FuelEntryFormValues) => {
    setServerError(null);
    setFlagWarning(null);

    try {
      const result = await createFuelRecordApi(
        {
          vehicleId: data.vehicleId,
          driverId: data.driverId || undefined,
          fuelDate: data.fuelDate,
          quantity: data.quantity,
          costPerLitre: data.costPerLitre,
          odometerReading: data.odometerReading,
          fuelStation: data.fuelStation,
          notes: data.notes,
        },
        receiptFile ?? undefined
      );

      if (result.flaggedForMisuse && result.flagReason) {
        setFlagWarning(
          `Entry saved but flagged: ${result.flagReason}`
        );
        toast.warning("Fuel entry saved with a misuse flag.");
      } else {
        toast.success("Fuel entry recorded successfully.");
      }

      reset();
      setReceiptFile(null);
      onSuccess?.();
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <FormMessage type="error" message={serverError} />
      )}
      {flagWarning && (
        <Alert
          variant="warning"
          title="Misuse Flag"
          message={flagWarning}
          dismissible
        />
      )}

      {/* Vehicle + Driver */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Vehicle <span className="text-amber-500">*</span>
          </label>
          <select
            {...register("vehicleId")}
            disabled={isSubmitting}
            defaultValue=""
            className={inputClass + " appearance-none cursor-pointer"}
          >
            <option value="" disabled>Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
          {errors.vehicleId && (
            <p className="text-xs text-red-400">{errors.vehicleId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Driver
          </label>
          <select
            {...register("driverId")}
            disabled={isSubmitting}
            defaultValue=""
            className={inputClass + " appearance-none cursor-pointer"}
          >
            <option value="">No driver assigned</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date + Fuel Station */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Fuel Date <span className="text-amber-500">*</span>
          </label>
          <input
            type="date"
            {...register("fuelDate")}
            disabled={isSubmitting}
            className={inputClass}
          />
          {errors.fuelDate && (
            <p className="text-xs text-red-400">{errors.fuelDate.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Fuel Station
          </label>
          <input
            type="text"
            placeholder="e.g. Lanka IOC Colombo"
            {...register("fuelStation")}
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>
      </div>

      {/* Quantity + Cost + Odometer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Quantity (L) <span className="text-amber-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            {...register("quantity")}
            disabled={isSubmitting}
            className={inputClass}
          />
          {errors.quantity && (
            <p className="text-xs text-red-400">{errors.quantity.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Cost / Litre (LKR) <span className="text-amber-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            {...register("costPerLitre")}
            disabled={isSubmitting}
            className={inputClass}
          />
          {errors.costPerLitre && (
            <p className="text-xs text-red-400">
              {errors.costPerLitre.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-300">
            Odometer (km) <span className="text-amber-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            {...register("odometerReading")}
            disabled={isSubmitting}
            className={inputClass}
          />
          {errors.odometerReading && (
            <p className="text-xs text-red-400">
              {errors.odometerReading.message}
            </p>
          )}
        </div>
      </div>

      {/* Estimated total */}
      {estimatedTotal && (
        <div className="rounded-xl bg-slate-800/60 border border-slate-700 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-slate-400">Estimated Total Cost</span>
          <span className="text-base font-bold text-amber-400">
            LKR {estimatedTotal}
          </span>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">
          Notes
        </label>
        <textarea
          rows={2}
          placeholder="Any additional notes..."
          {...register("notes")}
          disabled={isSubmitting}
          className={inputClass + " resize-none"}
        />
      </div>

      {/* Receipt upload */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">
          Receipt (optional)
        </label>

        {receiptFile ? (
          <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <FileText size={14} className="text-amber-400" />
              <span className="truncate max-w-xs">{receiptFile.name}</span>
              <span className="text-slate-500 text-xs">
                ({(receiptFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReceiptFile(null)}
              className="text-slate-500 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center
                        rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer
                        transition-colors text-center
                        ${
                          isDragActive
                            ? "border-amber-500/60 bg-amber-950/10"
                            : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                        }`}
          >
            <input {...getInputProps()} />
            <Upload size={20} className="text-slate-500 mb-2" />
            <p className="text-sm text-slate-500">
              {isDragActive
                ? "Drop the file here..."
                : "Drag & drop or click to upload receipt"}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              JPG, PNG, or PDF · Max 5MB
            </p>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl bg-amber-500 text-slate-900
                   hover:bg-amber-400 font-bold text-sm flex items-center
                   justify-center gap-2 disabled:opacity-60
                   disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting && <LoadingSpinner size={14} />}
        {isSubmitting ? "Saving..." : "Save Fuel Entry"}
      </Button>
    </form>
  );
}
