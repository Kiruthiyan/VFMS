"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { vehicleApi, VehicleFormData } from "@/lib/api/vehicle";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { toast } from "sonner";
import { Archive, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [initialData, setInitialData] = useState<VehicleFormData | null>(null);
  const [isRetired, setIsRetired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vehicleApi.getById(Number(id));
        const v = res.data;
        setIsRetired(v.status === "RETIRED" || v.active === false);
        setInitialData({
          plateNumber: v.plateNumber,
          brand: v.brand,
          model: v.model,
          year: v.year,
          vehicleType: v.vehicleType,
          fuelType: v.fuelType,
          department: v.department,
          color: v.color,
          seatingCapacity: v.seatingCapacity,
          insuranceExpiryDate: v.insuranceExpiryDate ?? "",
          revenueLicenseExpiryDate: v.revenueLicenseExpiryDate ?? "",
          odometerReading: v.odometerReading,
        });
      } catch {
        toast.error("Failed to load vehicle");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Vehicle not found.</p>
      </div>
    );
  }

  if (isRetired) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl p-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboards/fleet/vehicles/${id}`)}
            className="mb-4 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vehicle
          </Button>
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <Archive className="mb-4 h-10 w-10 text-slate-400" />
            <h1 className="text-xl font-semibold text-slate-900">
              Retired vehicle records are read-only
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              This vehicle has been retired from the fleet and cannot be edited.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <VehicleForm
        title="Edit Vehicle Details"
        initialData={initialData}
        onSubmit={async (data) => {
          await vehicleApi.update(Number(id), data);
          toast.success("Vehicle updated successfully!");
          router.push(`/dashboards/fleet/vehicles/${id}`);
        }}
      />
    </div>
  );
}
