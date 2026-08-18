"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  maintenanceApi,
  MaintenanceFormData,
  MaintenanceType,
} from "@/lib/api/maintenance";
import { getErrorMessage } from "@/lib/api";
import { Vehicle, vehicleApi } from "@/lib/api/vehicle";
import { maintenanceFormSchema } from "@/lib/validators/fleet-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FleetFileDropzone } from "@/components/fleet/FleetFileDropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wrench, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function CreateMaintenancePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema) as Resolver<MaintenanceFormData>,
    defaultValues: {
      vehicleId: 0,
      maintenanceType: "" as MaintenanceType,
      description: "",
      estimatedCost: undefined,
    },
  });

  useEffect(() => {
    vehicleApi
      .getAll()
      .then((res) => setVehicles(res.data))
      .catch(() => toast.error("Failed to load vehicles"));
  }, []);

  const fieldClass = (field: keyof MaintenanceFormData) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      const res = await maintenanceApi.create(data);
      if (quotationFile && res.data?.id) {
        try {
          await maintenanceApi.uploadQuotation(res.data.id, quotationFile);
          toast.success("Request created with quotation uploaded");
        } catch (error) {
          toast.warning(`Request created, but quotation upload failed: ${getErrorMessage(error)}`);
        }
      } else {
        toast.success("Maintenance request created");
      }
      router.push("/dashboards/fleet/maintenance");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="vfms-detail-page">
      <div className="vfms-detail-container animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-0 gap-0 pb-4">
          <CardHeader className="vfms-form-header py-5 pl-8">
            <CardTitle className="flex items-center gap-3 text-white text-lg">
              <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                <Wrench className="h-5 w-5" />
              </div>
              New Maintenance Request
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="vfms-form-section">
                <h3 className="vfms-form-section-title">
                  <span className="vfms-form-step">1</span>
                  Request Details
                </h3>
                <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Vehicle *
                </label>
                <Controller
                  control={control}
                  name="vehicleId"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        className={`bg-white text-slate-900 ${errors.vehicleId ? "border-red-400 ring-red-400" : ""}`}
                      >
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-slate-900">
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                            {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vehicleId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.vehicleId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Maintenance Type *
                </label>
                <Controller
                  control={control}
                  name="maintenanceType"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as MaintenanceType)}
                    >
                      <SelectTrigger className="bg-white text-slate-900">
                        <SelectValue placeholder="Select maintenance type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-slate-900">
                        <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                        <SelectItem value="ROUTINE_SERVICE">Routine Service</SelectItem>
                        <SelectItem value="ACCIDENT_DAMAGE">Accident Damage</SelectItem>
                        <SelectItem value="INSPECTION_REPAIR">Inspection Repair</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Description *
                </label>
                <textarea
                  {...register("description")}
                  className={`w-full border rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-400" : "border-slate-200"}`}
                  rows={4}
                  placeholder="Describe the issue..."
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Estimated Cost (Rs.){" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  {...register("estimatedCost", {
                    setValueAs: (value) => value === "" ? undefined : Number(value),
                  })}
                  className={fieldClass("estimatedCost")}
                />
                {errors.estimatedCost && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.estimatedCost.message}
                  </p>
                )}
              </div>
                </div>
              </div>

              <div className="vfms-form-section">
                <h3 className="vfms-form-section-title">
                  <span className="vfms-form-step">2</span>
                  Documents
                </h3>
              <FleetFileDropzone
                title="Quotation Document"
                optional
                file={quotationFile}
                onFileChange={setQuotationFile}
                uploadLabel="Upload Quotation"
                replaceLabel="Replace Quotation"
              />
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
