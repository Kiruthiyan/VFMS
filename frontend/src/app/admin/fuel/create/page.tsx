"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { FuelEntryForm } from "@/components/fuel/fuel-entry-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
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
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="Create Fuel Entry"
          description="Record a new fuel purchase using the same structured VFMS workflow used across the admin workspace."
          icon={Plus}
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/fuel">
                <ArrowLeft size={16} />
                Back to Fuel
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
              ) : (
                <FuelEntryForm
                  vehicles={vehicles}
                  drivers={drivers}
                  onSuccess={handleSuccess}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
