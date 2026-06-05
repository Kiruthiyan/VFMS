"use client";

import { useRouter } from "next/navigation";
import { vehicleApi } from "@/lib/api/vehicle";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { toast } from "sonner";

export default function AddVehiclePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <VehicleForm
        title="Register New Vehicle"
        onSubmit={async (data) => {
          await vehicleApi.create(data);
          toast.success("Vehicle added successfully!");
          router.push("/dashboard/vehicles");
        }}
      />
    </div>
  );
}
