"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { vehicleApi, VehicleFormData } from "@/lib/api/vehicle";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [initialData, setInitialData] = useState<VehicleFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vehicleApi.getById(Number(id));
        const v = res.data;
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
          insuranceExpiryDate: v.insuranceExpiryDate,
          revenueLicenseExpiryDate: v.revenueLicenseExpiryDate,
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

  return (
    <div className="min-h-screen bg-slate-50">
      <VehicleForm
        title="Edit Vehicle Details"
        initialData={initialData}
        onSubmit={async (data) => {
          await vehicleApi.update(Number(id), data);
          toast.success("Vehicle updated successfully!");
          router.push(`/dashboard/vehicles/${id}`);
        }}
      />
    </div>
  );
}
