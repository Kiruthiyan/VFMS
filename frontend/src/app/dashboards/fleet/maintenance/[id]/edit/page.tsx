"use client";

import { use, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { documentDisplayName, openAuthenticatedDocument } from "@/lib/fleet-documents";
import {
  maintenanceApi,
  MaintenanceFormData,
  MaintenanceRequest,
  MaintenanceType,
} from "@/lib/api/maintenance";
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
import { Wrench, ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditMaintenancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema) as Resolver<MaintenanceFormData>,
    defaultValues: {
      vehicleId: 0,
      maintenanceType: "ROUTINE_SERVICE",
      description: "",
      estimatedCost: undefined,
    },
  });

  useEffect(() => {
    Promise.all([vehicleApi.getAll(), maintenanceApi.getById(Number(id))])
      .then(([vehiclesRes, requestRes]) => {
        setVehicles(vehiclesRes.data);
        const loadedRequest = requestRes.data;
        setRequest(loadedRequest);
        reset({
          vehicleId: loadedRequest.vehicleId,
          maintenanceType: loadedRequest.maintenanceType,
          description: loadedRequest.description,
          estimatedCost: loadedRequest.estimatedCost || undefined,
        });
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const fieldClass = (field: keyof MaintenanceFormData) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      const updated = await maintenanceApi.update(Number(id), data);

      if (quotationFile) {
        const withQuotation = await maintenanceApi.uploadQuotation(Number(id), quotationFile);
        setRequest(withQuotation.data);
        toast.success("Request updated with quotation");
      } else {
        setRequest(updated.data);
        toast.success("Request updated");
      }

      router.push(`/dashboards/fleet/maintenance/${id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleOpenQuotation = async () => {
    if (!request?.quotationUrl) {
      return;
    }

    try {
      await openAuthenticatedDocument(request.quotationUrl, "maintenance");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-8 max-w-none mx-auto animate-in fade-in duration-500">
          <div className="mb-4 opacity-50 pointer-events-none inline-flex items-center text-sm font-medium text-slate-600 h-10 px-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </div>
          <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </Card>
        </div>
      </div>
    );
  }

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

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="vfms-form-header py-5 pl-8">
            <CardTitle className="flex items-center gap-3 text-white text-lg">
              <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                <Wrench className="h-5 w-5" />
              </div>
              Edit Maintenance Request
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
                      <SelectTrigger className="bg-white text-slate-900">
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
                        <SelectValue />
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
                  required
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Estimated Cost (Rs.)
                </label>
                <Input
                  type="number"
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
                  title="Quotation"
                  file={quotationFile}
                  existingFileName={
                    request?.quotationUrl
                      ? documentDisplayName(request.quotationUrl, "View quotation")
                      : undefined
                  }
                  onFileChange={setQuotationFile}
                  onOpenExisting={handleOpenQuotation}
                  uploadLabel="Upload"
                  replaceLabel="Replace"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
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
