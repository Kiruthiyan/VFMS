"use client";

import { useState } from "react";
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, Upload, X } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createFuelRecordApi,
  getErrorMessage,
  updateFuelRecordApi,
} from "@/lib/api/fuel";
import { formatLKR, todayStr } from "@/lib/fuel-utils";
import { cn } from "@/lib/utils";
import {
  fuelEntrySchema,
  type FuelEntryFormValues,
} from "@/lib/validators/fuel/fuel-entry-schema";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 " +
  "text-sm font-medium text-slate-900 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 " +
  "disabled:opacity-60 disabled:bg-slate-50 transition-all duration-200 " +
  "shadow-sm hover:border-slate-300";

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;
const ACCEPTED_RECEIPT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

interface FuelEntryFormProps {
  vehicles?: { id: string; label: string }[];
  drivers?: { id: string; label: string }[];
  driverId?: string;
  driverName?: string;
  mode?: "create" | "edit";
  recordId?: string;
  initialValues?: Partial<FuelEntryFormValues>;
  submitLabel?: string;
  onSuccess?: () => void;
}

export function FuelEntryForm({
  vehicles = [],
  drivers = [],
  driverId,
  driverName,
  mode = "create",
  recordId,
  initialValues,
  submitLabel,
  onSuccess,
}: FuelEntryFormProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptInputKey, setReceiptInputKey] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [flagWarning, setFlagWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FuelEntryFormValues>({
    resolver: zodResolver(fuelEntrySchema) as Resolver<FuelEntryFormValues>,
    defaultValues: {
      fuelDate: initialValues?.fuelDate ?? todayStr(),
      driverId: initialValues?.driverId ?? driverId ?? "",
      vehicleId: initialValues?.vehicleId ?? "",
      quantity: initialValues?.quantity,
      costPerLitre: initialValues?.costPerLitre,
      odometerReading: initialValues?.odometerReading,
      fuelStation: initialValues?.fuelStation ?? "",
      notes: initialValues?.notes ?? "",
    },
  });

  const isEditMode = mode === "edit";
  const resolvedSubmitLabel =
    submitLabel ?? (isEditMode ? "Update Fuel Entry" : "Save Fuel Entry");

  const quantity = useWatch({ control, name: "quantity" });
  const costPerLitre = useWatch({ control, name: "costPerLitre" });
  const estimatedTotal =
    quantity && costPerLitre
      ? Number(quantity) * Number(costPerLitre)
      : null;

  function resetReceiptSelection() {
    setReceiptFile(null);
    setReceiptInputKey((currentKey) => currentKey + 1);
  }

  function selectReceipt(file: File) {
    if (!ACCEPTED_RECEIPT_TYPES.has(file.type)) {
      toast.error("Please upload a JPG, PNG, WebP, or PDF receipt.");
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
      const payload = {
        vehicleId: data.vehicleId,
        driverId: data.driverId || undefined,
        fuelDate: data.fuelDate,
        quantity: data.quantity,
        costPerLitre: data.costPerLitre,
        odometerReading: data.odometerReading,
        fuelStation: data.fuelStation,
        notes: data.notes,
      };

      const result =
        isEditMode && recordId
          ? await updateFuelRecordApi(recordId, payload)
          : await createFuelRecordApi(payload, receiptFile ?? undefined);

      if (result.flaggedForMisuse && result.flagReason) {
        setFlagWarning(`Entry saved but flagged: ${result.flagReason}`);
        toast.warning(
          isEditMode
            ? "Fuel entry updated with a misuse flag."
            : "Fuel entry saved with a misuse flag."
        );
      } else {
        toast.success(
          isEditMode
            ? "Fuel entry updated successfully."
            : "Fuel entry recorded successfully."
        );
      }

      if (!isEditMode) {
        reset({
          fuelDate: todayStr(),
          driverId: driverId ?? "",
        });
        resetReceiptSelection();
      }
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

      <div className="vfms-form-section">
        <h3 className="vfms-form-section-title">
          <span className="vfms-form-step">
            1
          </span>
          Vehicle and Driver Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Vehicle <span className="text-red-600">*</span>
            </label>
            <Controller
              name="vehicleId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
            <Controller
              name="driverId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "NONE"}
                  onValueChange={(value) => field.onChange(value === "NONE" ? "" : value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="No driver assigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">
                      {driverName ? `No driver (${driverName})` : "No driver assigned"}
                    </SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <div className="vfms-form-section">
        <h3 className="vfms-form-section-title">
          <span className="vfms-form-step">
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

      <div className="vfms-form-section">
        <h3 className="vfms-form-section-title">
          <span className="vfms-form-step">
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
        <div className="flex items-center justify-between rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4">
          <span className="text-sm font-semibold text-slate-900">
            Estimated Total Cost
          </span>
          <span className="text-2xl font-semibold text-slate-950">
            {formatLKR(estimatedTotal)}
          </span>
        </div>
      )}

      <div className="vfms-form-section">
        <h3 className="vfms-form-section-title">
          <span className="vfms-form-step">
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
              className={inputClass + " h-auto resize-none py-3"}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Receipt (Optional)
            </label>

            {isEditMode ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Receipt uploads are only supported when creating a new fuel entry.
              </p>
            ) : receiptFile ? (
              <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-3 text-sm text-slate-900">
                  <FileText size={18} className="font-semibold text-slate-950" />
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
              <label
                htmlFor="fuel-receipt-upload"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.currentTarget.click();
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
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200 ${
                  isDragActive
                    ? "border-amber-400 bg-amber-50 shadow-md"
                    : "border-slate-300 bg-white hover:border-slate-400 hover:shadow-md"
                }`}
              >
                <input
                  key={receiptInputKey}
                  id="fuel-receipt-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
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
                  JPG, PNG, WebP, or PDF - Max 5MB
                </p>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {!isEditMode && (
          <button
            type="button"
            onClick={() => {
              reset({
                fuelDate: todayStr(),
                driverId: driverId ?? "",
              });
              resetReceiptSelection();
            }}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition-all hover:bg-slate-50"
          >
            Clear Form
          </button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex h-11 items-center justify-center gap-2 bg-slate-950 text-white hover:bg-slate-800",
            isEditMode ? "w-full" : "flex-1"
          )}
        >
          {isSubmitting && <LoadingSpinner size={14} />}
          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Saving..."
            : resolvedSubmitLabel}
        </Button>
      </div>
    </form>
  );
}
