"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { FuelEntryForm } from "@/components/fuel/fuel-entry-form";
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
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/admin/fuel"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              Fuel Management
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-700 text-xs font-medium">Create Entry</span>
          </div>

          <div className="mb-8">
            <PageHeader
              title="Create Fuel Entry"
              description="Record a new fuel purchase for your vehicle fleet"
              icon={Plus}
            />
          </div>

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-950 px-8 py-5 border-b border-slate-200">
              <h2 className="text-base font-bold text-white">Fuel Entry Details</h2>
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
          </div>
      </div>
    </AdminShell>
  );
}
