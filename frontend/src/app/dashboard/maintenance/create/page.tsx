"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { maintenanceApi, MaintenanceFormData, MaintenanceType } from "@/lib/api/maintenance";
import { Vehicle, vehicleApi } from "@/lib/api/vehicle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Wrench, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CreateMaintenancePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<MaintenanceFormData>({
    vehicleId: 0,
    maintenanceType: "ROUTINE_SERVICE",
    description: "",
    estimatedCost: undefined,
  });

  useEffect(() => {
    vehicleApi.getAll().then((res) => setVehicles(res.data)).catch(() => toast.error("Failed to load vehicles"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId) { toast.error("Select a vehicle"); return; }
    setLoading(true);
    try {
      await maintenanceApi.create(form);
      toast.success("Maintenance request created");
      router.push("/dashboard/maintenance");
    } catch {
      toast.error("Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-2xl mx-auto animate-in fade-in duration-500">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-white text-lg">
              <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                <Wrench className="h-5 w-5" />
              </div>
              New Maintenance Request
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Vehicle *</label>
                <Select onValueChange={(v) => setForm({ ...form, vehicleId: Number(v) })}>
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
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Maintenance Type *</label>
                <Select
                  value={form.maintenanceType}
                  onValueChange={(v) => setForm({ ...form, maintenanceType: v as MaintenanceType })}
                >
                  <SelectTrigger className="bg-white text-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-900">
                    <SelectItem value="BREAKDOWN">Breakdown</SelectItem>
                    <SelectItem value="ROUTINE_SERVICE">Routine Service</SelectItem>
                    <SelectItem value="ACCIDENT_DAMAGE">Accident Damage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description *</label>
                <textarea
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe the issue..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Estimated Cost (Rs.)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={form.estimatedCost || ""}
                  onChange={(e) => setForm({ ...form, estimatedCost: e.target.value ? Number(e.target.value) : undefined })}
                  className="text-slate-900"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button
                  type="submit"
                  className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Request"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
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
