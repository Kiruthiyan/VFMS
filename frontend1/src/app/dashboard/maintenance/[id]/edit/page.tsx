"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  maintenanceApi,
  MaintenanceFormData,
  MaintenanceType,
} from "@/lib/api/maintenance";
import { Vehicle, vehicleApi } from "@/lib/api/vehicle";
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
import { Wrench, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

type FieldErrors = { [key: string]: string };

export default function EditMaintenancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<MaintenanceFormData>({
    vehicleId: 0,
    maintenanceType: "ROUTINE_SERVICE",
    description: "",
    estimatedCost: undefined,
  });

  useEffect(() => {
    Promise.all([vehicleApi.getAll(), maintenanceApi.getById(Number(id))])
      .then(([vehiclesRes, requestRes]) => {
        setVehicles(vehiclesRes.data);
        const r = requestRes.data;
        setForm({
          vehicleId: r.vehicleId,
          maintenanceType: r.maintenanceType,
          description: r.description,
          estimatedCost: r.estimatedCost || undefined,
        });
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [id]);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.estimatedCost !== undefined && form.estimatedCost <= 0)
      errs.estimatedCost = "Cost must be greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await maintenanceApi.update(Number(id), form);
      toast.success("Request updated");
      router.push(`/dashboard/maintenance/${id}`);
    } catch {
      toast.error("Failed to update request");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = (field: string) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
          <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-white text-lg">
              <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                <Wrench className="h-5 w-5" />
              </div>
              Edit Maintenance Request
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Vehicle *
                </label>
                <Select
                  value={String(form.vehicleId)}
                  onValueChange={(v) =>
                    setForm({ ...form, vehicleId: Number(v) })
                  }
                >
                  <SelectTrigger className="bg-white text-slate-900">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-900">
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.brand} {v.model} — {v.plateNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Maintenance Type *
                </label>
                <Select
                  value={form.maintenanceType}
                  onValueChange={(v) =>
                    setForm({ ...form, maintenanceType: v as MaintenanceType })
                  }
                >
                  <SelectTrigger className="bg-white text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-900">
                    <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                    <SelectItem value="ROUTINE_SERVICE">
                      Routine Service
                    </SelectItem>
                    <SelectItem value="ACCIDENT_DAMAGE">
                      Accident Damage
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Description *
                </label>
                <textarea
                  className={`w-full border rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-400" : "border-slate-200"}`}
                  rows={4}
                  value={form.description}
                  onChange={(e) => {
                    setForm({ ...form, description: e.target.value });
                    clearError("description");
                  }}
                  required
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Estimated Cost (Rs.)
                </label>
                <Input
                  type="number"
                  value={form.estimatedCost || ""}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      estimatedCost: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    });
                    clearError("estimatedCost");
                  }}
                  className={fieldClass("estimatedCost")}
                />
                {errors.estimatedCost && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.estimatedCost}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="submit"
                  className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
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
