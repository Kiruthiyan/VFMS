"use client";

import { useCallback, useEffect, useState } from "react";
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
  type FuelLookupOption,
  type FuelRecord,
} from "@/lib/api/fuel";
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

  const [vehicles, setVehicles] = useState<FuelLookupOption[]>([]);
  const [drivers, setDrivers] = useState<FuelLookupOption[]>([]);
  const [initialValues, setInitialValues] = useState<Partial<FuelEntryFormValues>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPageData = useCallback(async () => {
    if (!recordId) {
      setError("Invalid fuel record ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [metadata, record] = await Promise.all([
        getFuelFormMetadataApi(),
        getFuelRecordByIdApi(recordId),
      ]);
      setVehicles(metadata.vehicles);
      setDrivers(metadata.drivers);
      setInitialValues(toFormValues(record));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  useEffect(() => {
    void loadPageData();
  }, [loadPageData]);

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
            ) : error ? (
              <FormMessage type="error" message={error} />
            ) : initialValues && recordId ? (
              <FuelEntryForm
                mode="edit"
                recordId={recordId}
                initialValues={initialValues}
                vehicles={vehicles}
                drivers={drivers}
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
