"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { FuelType, VehicleFormData, VehicleType } from "@/lib/api/vehicle";
import { vehicleFormSchema } from "@/lib/validators/fleet-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Car } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  initialData?: VehicleFormData;
  onSubmit: (data: VehicleFormData) => Promise<void>;
}

const DEFAULT_FORM: VehicleFormData = {
  plateNumber: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  vehicleType: "CAR",
  fuelType: "PETROL",
  department: "",
  color: "",
  seatingCapacity: undefined,
  insuranceExpiryDate: "",
  revenueLicenseExpiryDate: "",
  odometerReading: undefined,
};

export function VehicleForm({ title, initialData, onSubmit }: Props) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema) as Resolver<VehicleFormData>,
    defaultValues: initialData || DEFAULT_FORM,
  });

  const fieldClass = (field: keyof VehicleFormData) =>
    `bg-white text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  const submitForm = async (data: VehicleFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-0 gap-0 pb-4">
        <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
              <Car className="h-5 w-5" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(submitForm)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Plate Number *
                </label>
                <Input
                  {...register("plateNumber")}
                  placeholder="e.g. CP-NBM-4567"
                  className={fieldClass("plateNumber")}
                />
                {errors.plateNumber && (
                  <p className="text-red-500 text-xs">
                    {errors.plateNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Brand *
                </label>
                <Input
                  {...register("brand")}
                  placeholder="e.g. Toyota"
                  className={fieldClass("brand")}
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs">{errors.brand.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Model *
                </label>
                <Input
                  {...register("model")}
                  placeholder="e.g. Aqua"
                  className={fieldClass("model")}
                />
                {errors.model && (
                  <p className="text-red-500 text-xs">{errors.model.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Year *
                </label>
                <Input
                  type="number"
                  min={1980}
                  max={2100}
                  {...register("year", {
                    setValueAs: (value) => value === "" ? undefined : Number(value),
                  })}
                  className={fieldClass("year")}
                />
                {errors.year && (
                  <p className="text-red-500 text-xs">{errors.year.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Vehicle Type *
                </label>
                <Controller
                  control={control}
                  name="vehicleType"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as VehicleType)}
                    >
                      <SelectTrigger className="bg-white text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-slate-900">
                        <SelectItem value="CAR">Car</SelectItem>
                        <SelectItem value="VAN">Van</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="BUS">Bus</SelectItem>
                        <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Fuel Type *
                </label>
                <Controller
                  control={control}
                  name="fuelType"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as FuelType)}
                    >
                      <SelectTrigger className="bg-white text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-slate-900">
                        <SelectItem value="PETROL">Petrol</SelectItem>
                        <SelectItem value="DIESEL">Diesel</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                        <SelectItem value="ELECTRIC">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Department{" "}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                {...register("department")}
                placeholder="e.g. IT Department"
                className={fieldClass("department")}
              />
            </div>

            <div className="pt-2 pb-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Additional Details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Color{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  {...register("color")}
                  placeholder="e.g. White, Silver"
                  className={fieldClass("color")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Seating Capacity{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  {...register("seatingCapacity", {
                    setValueAs: (value) => value === "" ? undefined : Number(value),
                  })}
                  placeholder="e.g. 5"
                  className={fieldClass("seatingCapacity")}
                />
                {errors.seatingCapacity && (
                  <p className="text-red-500 text-xs">
                    {errors.seatingCapacity.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Odometer Reading{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  {...register("odometerReading", {
                    setValueAs: (value) => value === "" ? undefined : Number(value),
                  })}
                  placeholder="e.g. 45200"
                  className={fieldClass("odometerReading")}
                />
                {errors.odometerReading && (
                  <p className="text-red-500 text-xs">
                    {errors.odometerReading.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 pb-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Compliance & Expiry Dates
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Insurance Expiry{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="date"
                  {...register("insuranceExpiryDate", {
                    setValueAs: (value) => value === "" ? undefined : value,
                  })}
                  className={fieldClass("insuranceExpiryDate")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Revenue License Expiry{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="date"
                  {...register("revenueLicenseExpiryDate", {
                    setValueAs: (value) => value === "" ? undefined : value,
                  })}
                  className={fieldClass("revenueLicenseExpiryDate")}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
              >
                {isSubmitting
                  ? "Saving..."
                  : title.includes("Edit")
                    ? "Update Vehicle"
                    : "Register Vehicle"}
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
  );
}
