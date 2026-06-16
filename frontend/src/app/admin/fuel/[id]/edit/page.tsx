"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

import { FuelEntryForm } from "@/components/fuel/fuel-entry-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
    <div className="space-y-6">
      <PageHeader
        title="Edit Fuel Entry"
        description="Update fuel purchase details. Misuse checks run again after save."
        icon={Pencil}
        actions={
          <Button asChild variant="outline">
            <Link href={recordId ? `/admin/fuel/${recordId}` : "/admin/fuel"}>
              <ArrowLeft size={16} />
              Back to Record
            </Link>
          </Button>
        }
      />

      <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-slate-200 px-8 py-5">
            <CardTitle className="text-base font-semibold text-slate-950">
              Fuel Entry Details
            </CardTitle>
          </div>
          <div className="p-8">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
