"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { maintenanceApi, MaintenanceFormData, MaintenanceType } from "@/lib/api/maintenance";
import { Vehicle, vehicleApi } from "@/lib/api/vehicle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Wrench, ArrowLeft, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

type FieldErrors = { [key: string]: string };

export default function CreateMaintenancePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<MaintenanceFormData>({
    vehicleId: 0,
    maintenanceType: "ROUTINE_SERVICE",
    description: "",
    estimatedCost: undefined,
  });

  useEffect(() => {
    vehicleApi.getAll().then((res) => setVehicles(res.data)).catch(() => toast.error("Failed to load vehicles"));
  }, []);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.vehicleId) errs.vehicleId = "Please select a vehicle";
    if (!form.description.trim()) errs.description = "Description is required";
    if (form.estimatedCost !== undefined && form.estimatedCost <= 0) errs.estimatedCost = "Cost must be greater than 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await maintenanceApi.create(form);
      if (quotationFile && res.data?.id) {
        try {
          await maintenanceApi.uploadQuotation(res.data.id, quotationFile);
          toast.success("Request created with quotation uploaded");
        } catch {
          toast.success("Request created, but quotation upload failed");
        }
      } else {
        toast.success("Maintenance request created");
      }
      router.push("/dashboard/maintenance");
    } catch {
      toast.error("Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field: string) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

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
                <Select onValueChange={(v) => { setForm({ ...form, vehicleId: Number(v) }); clearError("vehicleId"); }}>
                  <SelectTrigger className={`bg-white text-slate-900 ${errors.vehicleId ? "border-red-400 ring-red-400" : ""}`}>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-900">
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.brand} {v.model} — {v.plateNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleId && <p className="text-red-500 text-xs mt-1">{errors.vehicleId}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Maintenance Type *</label>
                <Select value={form.maintenanceType} onValueChange={(v) => setForm({ ...form, maintenanceType: v as MaintenanceType })}>
                  <SelectTrigger className="bg-white text-slate-900"><SelectValue /></SelectTrigger>
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
                  className={`w-full border rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-400" : "border-slate-200"}`}
                  rows={4} placeholder="Describe the issue..."
                  value={form.description} onChange={(e) => { setForm({ ...form, description: e.target.value }); clearError("description"); }}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Estimated Cost (Rs.) <span className="text-slate-400 font-normal">(Optional)</span></label>
                <Input type="number" placeholder="e.g. 5000" value={form.estimatedCost || ""}
                  onChange={(e) => { setForm({ ...form, estimatedCost: e.target.value ? Number(e.target.value) : undefined }); clearError("estimatedCost"); }}
                  className={fieldClass("estimatedCost")} />
                {errors.estimatedCost && <p className="text-red-500 text-xs mt-1">{errors.estimatedCost}</p>}
              </div>

              {/* Quotation Upload */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Quotation Document <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.png" className="hidden"
                  onChange={(e) => setQuotationFile(e.target.files?.[0] || null)} />
                {quotationFile ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-slate-700 flex-1 truncate">{quotationFile.name}</span>
                    <button type="button" onClick={() => { setQuotationFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors">
                      <X className="h-3 w-3 text-slate-600" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                    <Upload className="h-4 w-4" /> Click to upload quotation document
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button type="submit" className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200" disabled={loading}>
                  {loading ? "Creating..." : "Create Request"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
