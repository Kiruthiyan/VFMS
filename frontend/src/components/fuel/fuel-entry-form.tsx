"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, Upload, X } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  createFuelRecordApi,
  getErrorMessage,
} from "@/lib/api/fuel";
import {
  fuelEntrySchema,
  type FuelEntryFormValues,
} from "@/lib/validators/fuel/fuel-entry-schema";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 " +
  "text-sm font-medium text-slate-900 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-950/40 focus:border-blue-950 " +
  "disabled:opacity-60 disabled:bg-slate-50 transition-all duration-200 " +
  "shadow-sm hover:shadow-md";

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;
const ACCEPTED_RECEIPT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
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
    defaultValues: {
      fuelDate: new Date().toISOString().split("T")[0],
      driverId: driverId ?? "",
    },
  });

  const quantity = watch("quantity");
  const costPerLitre = watch("costPerLitre");
  const estimatedTotal =
    quantity && costPerLitre
      ? (Number(quantity) * Number(costPerLitre)).toFixed(2)
      : null;

  function resetReceiptSelection() {
    setReceiptFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function selectReceipt(file: File) {
    if (!ACCEPTED_RECEIPT_TYPES.has(file.type)) {
      toast.error("Please upload a JPG, PNG, or PDF receipt.");
      return;
    }

    if (file.size > MAX_RECEIPT_SIZE) {
      toast.error("Receipt must be 5MB or smaller.");
      return;
    }

    setServerError(null);
    setReceiptFile(file);
  }

  function handleFileSelection(files: FileList | null) {
    const file = files?.[0];
    if (file) {
      selectReceipt(file);
    }
  }

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
        setFlagWarning(`Entry saved but flagged: ${result.flagReason}`);
        toast.warning("Fuel entry saved with a misuse flag.");
      } else {
        toast.success("Fuel entry recorded successfully.");
      }

      reset({
        fuelDate: new Date().toISOString().split("T")[0],
        driverId: driverId ?? "",
      });
      resetReceiptSelection();
      onSuccess?.();
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <FormMessage type="error" message={serverError} />}
      {flagWarning && (
        <Alert
          variant="warning"
          title="Misuse Flag"
          message={flagWarning}
          dismissible
        />
      )}

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-950 text-xs text-white">
            1
          </span>
          Vehicle and Driver Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <option value="" disabled>
                Select vehicle
              </option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.label}
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-xs font-medium text-red-600">
                {errors.vehicleId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Driver
            </label>
            <select
              {...register("driverId")}
              disabled={isSubmitting}
              defaultValue={driverId ?? ""}
              className={inputClass + " appearance-none cursor-pointer"}
            >
              <option value="">{driverName ? `No driver (${driverName})` : "No driver assigned"}</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-950 text-xs text-white">
            2
          </span>
          Fuel Details
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              <p className="text-xs font-medium text-red-600">
                {errors.fuelDate.message}
              </p>
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

      <div className="border-t border-slate-200 pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-950 text-xs text-white">
            3
          </span>
          Fuel Quantity and Cost
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <p className="text-xs font-medium text-red-600">
                {errors.quantity.message}
              </p>
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
              <p className="text-xs font-medium text-red-600">
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
              <p className="text-xs font-medium text-red-600">
                {errors.odometerReading.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {estimatedTotal && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-6 py-4">
          <span className="text-sm font-semibold text-slate-900">
            Estimated Total Cost
          </span>
          <span className="text-2xl font-bold text-blue-950">
            LKR {estimatedTotal}
          </span>
        </div>
      )}

      <div className="border-t border-slate-200 pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-950 text-xs text-white">
            4
          </span>
          Additional Information
        </h3>
        <div className="space-y-4">
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

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Receipt (Optional)
            </label>

            {receiptFile ? (
              <div className="flex items-center justify-between rounded-lg border border-blue-300 bg-blue-50 px-4 py-3">
                <div className="flex items-center gap-3 text-sm text-slate-900">
                  <FileText size={18} className="font-semibold text-blue-950" />
                  <span className="max-w-xs truncate font-medium">
                    {receiptFile.name}
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    ({(receiptFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetReceiptSelection}
                  className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                  handleFileSelection(event.dataTransfer.files);
                }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-all duration-200 ${
                  isDragActive
                    ? "border-blue-950 bg-blue-50 shadow-md"
                    : "border-slate-300 bg-white hover:border-slate-400 hover:shadow-md"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(event) => handleFileSelection(event.target.files)}
                />
                <Upload size={24} className="mb-3 font-semibold text-slate-600" />
                <p className="text-sm font-semibold text-slate-900">
                  {isDragActive
                    ? "Drop the file here..."
                    : "Drag and drop or click to upload receipt"}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600">
                  JPG, PNG, or PDF - Max 5MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={() => {
            reset({
              fuelDate: new Date().toISOString().split("T")[0],
              driverId: driverId ?? "",
            });
            resetReceiptSelection();
          }}
          className="h-11 flex-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition-all hover:bg-slate-50"
        >
          Clear Form
        </button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-950 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-200 hover:bg-blue-900 active:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <LoadingSpinner size={14} />}
          {isSubmitting ? "Saving..." : "Save Fuel Entry"}
        </Button>
      </div>
    </form>
  );
}
