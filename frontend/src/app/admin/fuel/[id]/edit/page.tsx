"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

import { FuelEntryForm } from "@/components/fuel/fuel-entry-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getFuelFormMetadataApi,
  getFuelRecordByIdApi,
  getErrorMessage,
  type FuelRecord,
} from "@/lib/api/fuel";
import { queryKeys } from "@/lib/query-keys";
import type { FuelEntryFormValues } from "@/lib/validators/fuel/fuel-entry-schema";

function toDateInputValue(dateStr: string): string {
  return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
}

function toFormValues(record: FuelRecord): Partial<FuelEntryFormValues> {
  return {
    vehicleId: record.vehicleId,
    driverId: record.driverId ?? "",
    fuelDate: toDateInputValue(record.fuelDate),
    quantity: record.quantity,
    costPerLitre: record.costPerLitre,
    odometerReading: record.odometerReading,
    fuelStation: record.fuelStation ?? "",
    notes: record.notes ?? "",
  };
}

export default function EditFuelEntryPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    data: metadata,
    error: metadataError,
    isLoading: metadataLoading,
  } = useQuery({
    queryKey: queryKeys.fuelMetadata,
    queryFn: getFuelFormMetadataApi,
    placeholderData: (previous) => previous,
  });
  const {
    data: record,
    error: recordError,
    isLoading: recordLoading,
  } = useQuery({
    queryKey: queryKeys.fuelRecord(recordId ?? "missing"),
    queryFn: () => getFuelRecordByIdApi(recordId as string),
    enabled: Boolean(recordId),
    placeholderData: (previous) => previous,
  });
  const initialValues = useMemo(
    () => (record ? toFormValues(record) : undefined),
    [record]
  );
  const loading = metadataLoading || recordLoading;
  const errorMessage = !recordId
    ? "Invalid fuel record ID"
    : metadataError
      ? getErrorMessage(metadataError)
      : recordError
        ? getErrorMessage(recordError)
        : null;

  const handleSuccess = () => {
    router.push(`/admin/fuel/${recordId}`);
  };

  return (
    <div className="mx-auto max-w-none animate-in fade-in duration-500">
      <Button
        variant="ghost"
        onClick={() => router.push(recordId ? `/admin/fuel/${recordId}` : "/admin/fuel")}
        className="mb-4 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Record
      </Button>

      <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white p-0 pb-4 shadow-sm">
        <CardHeader className="vfms-form-header py-5 pl-8">
          <CardTitle className="flex items-center gap-3 text-lg text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <Pencil className="h-5 w-5" />
            </div>
            Edit Fuel Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner size={24} className="text-slate-950" />
              </div>
            ) : errorMessage ? (
              <FormMessage type="error" message={errorMessage} />
            ) : initialValues && recordId ? (
              <FuelEntryForm
                mode="edit"
                recordId={recordId}
                initialValues={initialValues}
                vehicles={metadata?.vehicles ?? []}
                drivers={metadata?.drivers ?? []}
                onSuccess={handleSuccess}
              />
            ) : (
              <FormMessage type="error" message="Fuel entry not found" />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
