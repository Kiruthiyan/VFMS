"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { FuelEntryForm } from "@/components/fuel/fuel-entry-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getFuelFormMetadataApi,
  getErrorMessage,
  type FuelLookupOption,
} from "@/lib/api/fuel";

export default function CreateFuelEntryPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<FuelLookupOption[]>([]);
  const [drivers, setDrivers] = useState<FuelLookupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetadata = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const metadata = await getFuelFormMetadataApi();
      setVehicles(metadata.vehicles);
      setDrivers(metadata.drivers);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  const handleSuccess = () => {
    router.push("/admin/fuel");
  };

  return (

      <div className="mx-auto max-w-none animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/fuel")}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Fuel
        </Button>

        <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white p-0 pb-4 shadow-sm">
          <CardHeader className="vfms-form-header py-5 pl-8">
            <CardTitle className="flex items-center gap-3 text-lg text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
                <Plus className="h-5 w-5" />
              </div>
              Create Fuel Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner size={24} className="text-slate-950" />
                </div>
              ) : error ? (
                <FormMessage type="error" message={error} />
              ) : (
                <FuelEntryForm
                  vehicles={vehicles}
                  drivers={drivers}
                  onSuccess={handleSuccess}
                />
              )}
          </CardContent>
        </Card>
      </div>

  );
}
