"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VehicleFormData } from "@/lib/api/vehicle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Car } from "lucide-react";
import { toast } from "sonner";

type FieldErrors = { [key: string]: string };

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
};

export function VehicleForm({ title, initialData, onSubmit }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VehicleFormData>(initialData || DEFAULT_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleChange = (field: keyof VehicleFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.plateNumber.trim()) errs.plateNumber = "Plate number is required";
    if (!form.brand.trim()) errs.brand = "Brand is required";
    if (!form.model.trim()) errs.model = "Model is required";
    if (form.year < 1980 || form.year > new Date().getFullYear() + 1)
      errs.year = "Year must be between 1980 and " + (new Date().getFullYear() + 1);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await onSubmit(form);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = (field: string) =>
    `bg-white text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  return (
    <div className="p-8 max-w-2xl mx-auto animate-in fade-in duration-500">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-slate-600 hover:text-slate-900">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
          <CardTitle className="flex items-center gap-3 text-white text-lg">
            <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
              <Car className="h-5 w-5" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Plate Number *</label>
                <Input
                  value={form.plateNumber}
                  onChange={(e) => handleChange("plateNumber", e.target.value)}
                  placeholder="e.g. WP-CAB-1234"
                  className={fieldClass("plateNumber")}
                />
                {errors.plateNumber && <p className="text-red-500 text-xs">{errors.plateNumber}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Brand *</label>
                <Input
                  value={form.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  placeholder="e.g. Toyota"
                  className={fieldClass("brand")}
                />
                {errors.brand && <p className="text-red-500 text-xs">{errors.brand}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Model *</label>
                <Input
                  value={form.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="e.g. Aqua"
                  className={fieldClass("model")}
                />
                {errors.model && <p className="text-red-500 text-xs">{errors.model}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Year *</label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) => handleChange("year", parseInt(e.target.value))}
                  min={1980}
                  max={2100}
                  className={fieldClass("year")}
                />
                {errors.year && <p className="text-red-500 text-xs">{errors.year}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Vehicle Type *</label>
                <Select value={form.vehicleType} onValueChange={(v) => handleChange("vehicleType", v)}>
                  <SelectTrigger className="bg-white text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white text-slate-900">
                    <SelectItem value="CAR">Car</SelectItem>
                    <SelectItem value="VAN">Van</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="BUS">Bus</SelectItem>
                    <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Fuel Type *</label>
                <Select value={form.fuelType} onValueChange={(v) => handleChange("fuelType", v)}>
                  <SelectTrigger className="bg-white text-slate-900"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white text-slate-900">
                    <SelectItem value="PETROL">Petrol</SelectItem>
                    <SelectItem value="DIESEL">Diesel</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    <SelectItem value="ELECTRIC">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Department</label>
              <Input
                value={form.department || ""}
                onChange={(e) => handleChange("department", e.target.value)}
                placeholder="e.g. IT Department (optional)"
                className="bg-white text-slate-900"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
              >
                {saving ? "Saving..." : title.includes("Edit") ? "Update Vehicle" : "Register Vehicle"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
