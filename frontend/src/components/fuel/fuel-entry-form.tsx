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
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 " +
  "text-sm font-medium text-slate-900 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-950/40 focus:border-blue-950 " +
  "disabled:opacity-60 disabled:bg-slate-50 transition-all duration-200 " +
  "shadow-sm hover:shadow-md";

interface FuelEntryFormProps {
  vehicles?: { id: string; label: string }[];
  drivers?: { id: string; label: string }[];
  driverId?: string;
  driverName?: string;
  onSuccess?: () => void;
}

export function FuelEntryForm({
  vehicles = [],
  drivers = [],
  driverId,
  driverName,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      {/* Vehicle & Driver Section */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-blue-950 text-white flex items-center justify-center text-xs">1</span>
          Vehicle & Driver Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Vehicle <span className="text-red-600">*</span>
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
              <p className="text-xs text-red-600 font-medium">{errors.vehicleId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
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
      </div>

      {/* Fuel Details Section */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-blue-950 text-white flex items-center justify-center text-xs">2</span>
          Fuel Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Fuel Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              {...register("fuelDate")}
              disabled={isSubmitting}
              className={inputClass}
            />
            {errors.fuelDate && (
              <p className="text-xs text-red-600 font-medium">{errors.fuelDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
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
      </div>

      {/* Quantity & Cost Section */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-blue-950 text-white flex items-center justify-center text-xs">3</span>
          Fuel Quantity & Cost
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Quantity (L) <span className="text-red-600">*</span>
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
              <p className="text-xs text-red-600 font-medium">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Cost / Litre (LKR) <span className="text-red-600">*</span>
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
              <p className="text-xs text-red-600 font-medium">
                {errors.costPerLitre.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Odometer (km) <span className="text-red-600">*</span>
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
              <p className="text-xs text-red-600 font-medium">
                {errors.odometerReading.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Estimated Total */}
      {estimatedTotal && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">Estimated Total Cost</span>
          <span className="text-2xl font-bold text-blue-950">
            LKR {estimatedTotal}
          </span>
        </div>
      )}

      {/* Additional Section */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-blue-950 text-white flex items-center justify-center text-xs">4</span>
          Additional Information
        </h3>
        <div className="space-y-4">
          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Any additional notes about this fuel entry..."
              {...register("notes")}
              disabled={isSubmitting}
              className={inputClass + " resize-none"}
            />
          </div>

          {/* Receipt */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Receipt (Optional)
            </label>

            {receiptFile ? (
              <div className="flex items-center justify-between rounded-lg border border-blue-300 bg-blue-50 px-4 py-3">
                <div className="flex items-center gap-3 text-sm text-slate-900">
                  <FileText size={18} className="text-blue-950 font-semibold" />
                  <span className="truncate max-w-xs font-medium">{receiptFile.name}</span>
                  <span className="text-slate-600 text-xs font-medium">
                    ({(receiptFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptFile(null)}
                  className="text-slate-600 hover:text-red-600 transition-colors hover:bg-red-50 p-1.5 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 
                            cursor-pointer transition-all duration-200 text-center
                            ${
                              isDragActive
                                ? "border-blue-950 bg-blue-50 shadow-md"
                                : "border-slate-300 bg-white hover:border-slate-400 hover:shadow-md"
                            }`}
              >
                <input {...getInputProps()} />
                <Upload size={24} className="text-slate-600 mb-3 font-semibold" />
                <p className="text-sm text-slate-900 font-semibold">
                  {isDragActive
                    ? "Drop the file here..."
                    : "Drag & drop or click to upload receipt"}
                </p>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  JPG, PNG, or PDF · Max 5MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="border-t border-slate-200 pt-6 flex gap-3">
        <button
          type="button"
          onClick={() => {
            reset();
            setReceiptFile(null);
          }}
          className="flex-1 h-11 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm transition-all"
        >
          Clear Form
        </button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-11 rounded-lg bg-blue-950 text-white font-semibold text-sm
                     hover:bg-blue-900 active:bg-blue-950 disabled:opacity-60 shadow-lg shadow-blue-200
                     disabled:cursor-not-allowed transition-all duration-200 flex items-center
                     justify-center gap-2"
        >
          {isSubmitting && <LoadingSpinner size={14} />}
          {isSubmitting ? "Saving..." : "Save Fuel Entry"}
        </Button>
      </div>
    </form>
  );
}
