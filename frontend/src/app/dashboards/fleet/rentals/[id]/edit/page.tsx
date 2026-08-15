"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { documentDisplayName, openAuthenticatedDocument } from "@/lib/fleet-documents";
import { rentalApi, RentalFormData, RentalRecord, Vendor, vendorApi } from "@/lib/api/rental";
import { rentalFormSchema } from "@/lib/validators/fleet-schemas";
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
import { Car, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EditRentalPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rental, setRental] = useState<RentalRecord | null>(null);
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RentalFormData>({
    resolver: zodResolver(rentalFormSchema) as Resolver<RentalFormData>,
    defaultValues: {
      vendorId: 0,
      vehicleType: "",
      plateNumber: "",
      startDate: "",
      endDate: undefined,
      costPerDay: 0,
      purpose: "",
    },
  });

  useEffect(() => {
    Promise.all([rentalApi.getById(Number(id)), vendorApi.getAll()])
      .then(([rentalRes, vendorRes]) => {
        const loadedRental = rentalRes.data;
        setRental(loadedRental);
        setVendors(vendorRes.data);
        reset({
          vendorId: loadedRental.vendorId,
          vehicleType: loadedRental.vehicleType,
          plateNumber: loadedRental.plateNumber,
          startDate: loadedRental.startDate,
          endDate: loadedRental.endDate || undefined,
          costPerDay: loadedRental.costPerDay,
          purpose: loadedRental.purpose || "",
        });
      })
      .catch(() => toast.error("Failed to load rental data"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const fieldClass = (field: keyof RentalFormData) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  const onSubmit = async (data: RentalFormData) => {
    try {
      const updated = await rentalApi.update(Number(id), data);

      if (agreementFile) {
        const withAgreement = await rentalApi.uploadAgreement(Number(id), agreementFile);
        setRental(withAgreement.data);
        toast.success("Rental updated with agreement");
      } else {
        setRental(updated.data);
        toast.success("Rental updated");
      }

      router.push(`/dashboards/fleet/rentals/${id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleOpenAgreement = async () => {
    if (!rental?.agreementUrl) {
      return;
    }

    try {
      await openAuthenticatedDocument(rental.agreementUrl);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-950" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-2xl mx-auto animate-in fade-in duration-500">
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
                <Car className="h-5 w-5" />
              </div>
              Edit Rental #{id}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="vfms-form-section">
                <h3 className="vfms-form-section-title">
                  <span className="vfms-form-step">1</span>
                  Rental Details
                </h3>
                <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Vendor *
                </label>
                <Controller
                  control={control}
                  name="vendorId"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger
                        className={`bg-white text-slate-900 ${errors.vendorId ? "border-red-400 ring-red-400" : ""}`}
                      >
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-slate-900">
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={String(vendor.id)}>
                            {vendor.name} - {vendor.contactPerson}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vendorId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.vendorId.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Vehicle Type *
                  </label>
                  <Input
                    {...register("vehicleType")}
                    placeholder="SUV, Van, Sedan..."
                    className={fieldClass("vehicleType")}
                  />
                  {errors.vehicleType && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.vehicleType.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Plate Number *
                  </label>
                  <Input
                    {...register("plateNumber")}
                    placeholder="e.g. CP-NBM-4567"
                    className={fieldClass("plateNumber")}
                  />
                  {errors.plateNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.plateNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    {...register("startDate")}
                    className={fieldClass("startDate")}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    {...register("endDate", {
                      setValueAs: (value) => value === "" ? undefined : value,
                    })}
                    className={fieldClass("endDate")}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Vendor&apos;s Daily Rate (Rs.) *
                </label>
                <p className="text-xs text-slate-400 mb-1.5">
                  Enter the rate quoted by the vendor in their agreement
                </p>
                <Input
                  type="number"
                  placeholder="e.g. 3000"
                  {...register("costPerDay", {
                    setValueAs: (value) => value === "" ? 0 : Number(value),
                  })}
                  className={fieldClass("costPerDay")}
                />
                {errors.costPerDay && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.costPerDay.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Purpose
                </label>
                <textarea
                  {...register("purpose")}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Staff transport, client visit..."
                />
              </div>
                </div>
              </div>

              <div className="vfms-form-section">
                <h3 className="vfms-form-section-title">
                  <span className="vfms-form-step">2</span>
                  Documents
                </h3>
                <FleetFileDropzone
                  title="Rental Agreement"
                  file={agreementFile}
                  existingFileName={
                    rental?.agreementUrl
                      ? documentDisplayName(rental.agreementUrl, "View agreement")
                      : undefined
                  }
                  onFileChange={setAgreementFile}
                  onOpenExisting={handleOpenAgreement}
                  uploadLabel="Upload"
                  replaceLabel="Replace"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="submit"
                  className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                  disabled={isSubmitting}
                >
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
