"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { rentalApi, RentalFormData, Vendor, vendorApi } from "@/lib/api/rental";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Car, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type FieldErrors = { [key: string]: string };

export default function EditRentalPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<RentalFormData>({
    vendorId: 0, vehicleType: "", plateNumber: "", startDate: "", costPerDay: 0, purpose: "",
  });

  useEffect(() => {
    Promise.all([rentalApi.getById(Number(id)), vendorApi.getAll()])
      .then(([rentalRes, vendorRes]) => {
        const r = rentalRes.data;
        setForm({
          vendorId: r.vendorId, vehicleType: r.vehicleType, plateNumber: r.plateNumber,
          startDate: r.startDate, endDate: r.endDate || undefined, costPerDay: r.costPerDay, purpose: r.purpose || "",
        });
        setVendors(vendorRes.data);
        setLoading(false);
      }).catch(() => { toast.error("Failed to load rental data"); setLoading(false); });
  }, [id]);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.vendorId) errs.vendorId = "Please select a vendor";
    if (!form.vehicleType.trim()) errs.vehicleType = "Vehicle type is required";
    if (!form.plateNumber.trim()) errs.plateNumber = "Plate number is required";
    if (form.costPerDay <= 0) errs.costPerDay = "Cost must be greater than 0";
    if (form.endDate && form.endDate < form.startDate) errs.endDate = "End date cannot be before start date";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await rentalApi.update(Number(id), form);
      toast.success("Rental updated");
      router.push(`/dashboard/rentals/${id}`);
    } catch { toast.error("Failed to update rental"); }
    finally { setSubmitting(false); }
  };

  const fieldClass = (field: string) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

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
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-white text-lg">
              <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                <Car className="h-5 w-5" />
              </div>
              Edit Rental #{id}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Vendor *</label>
                <Select value={String(form.vendorId)} onValueChange={(v) => { setForm({ ...form, vendorId: Number(v) }); clearError("vendorId"); }}>
                  <SelectTrigger className={`bg-white text-slate-900 ${errors.vendorId ? "border-red-400 ring-red-400" : ""}`}>
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-slate-900">
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>{v.name} — {v.contactPerson}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vendorId && <p className="text-red-500 text-xs mt-1">{errors.vendorId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Vehicle Type *</label>
                  <Input value={form.vehicleType} onChange={(e) => { setForm({ ...form, vehicleType: e.target.value }); clearError("vehicleType"); }}
                    placeholder="SUV, Van, Sedan..." className={fieldClass("vehicleType")} />
                  {errors.vehicleType && <p className="text-red-500 text-xs mt-1">{errors.vehicleType}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Plate Number *</label>
                  <Input value={form.plateNumber} onChange={(e) => { setForm({ ...form, plateNumber: e.target.value }); clearError("plateNumber"); }}
                    placeholder="EXT-1234" className={fieldClass("plateNumber")} />
                  {errors.plateNumber && <p className="text-red-500 text-xs mt-1">{errors.plateNumber}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Start Date *</label>
                  <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required className="text-slate-900" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">End Date</label>
                  <Input type="date" value={form.endDate || ""} onChange={(e) => { setForm({ ...form, endDate: e.target.value || undefined }); clearError("endDate"); }}
                    className={fieldClass("endDate")} />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Vendor's Daily Rate (Rs.) *</label>
                <p className="text-xs text-slate-400 mb-1.5">Enter the rate quoted by the vendor in their agreement</p>
                <Input type="number" placeholder="e.g. 3000" value={form.costPerDay || ""}
                  onChange={(e) => { setForm({ ...form, costPerDay: Number(e.target.value) }); clearError("costPerDay"); }}
                  className={fieldClass("costPerDay")} />
                {errors.costPerDay && <p className="text-red-500 text-xs mt-1">{errors.costPerDay}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Purpose</label>
                <textarea className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3} placeholder="Staff transport, client visit..." value={form.purpose || ""}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <Button type="submit" className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
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
