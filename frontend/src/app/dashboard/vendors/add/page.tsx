"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { vendorApi, VendorFormData } from "@/lib/api/rental";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

type FieldErrors = { [key: string]: string };

export default function AddVendorPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState<VendorFormData>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });

  const fieldClass = (field: string) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.name.trim()) errs.name = "Vendor name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      errs.email = "Enter a valid email";
    if (form.phone && !/^07\d{8}$/.test(form.phone.replace(/[\s-]/g, "")))
      errs.phone = "Enter a valid Sri Lankan number (e.g. 0771234567)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await vendorApi.create(form);
      toast.success("Vendor added successfully");
      router.push("/dashboard/vendors");
    } catch {
      toast.error("Failed to add vendor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/vendors")}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors
        </Button>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-white text-lg">
              <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                <Building2 className="h-5 w-5" />
              </div>
              Add New Vendor
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Vendor Name *
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    placeholder="City Rentals"
                    className={fieldClass("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Contact Person{" "}
                    <span className="text-slate-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    value={form.contactPerson || ""}
                    onChange={(e) =>
                      setForm({ ...form, contactPerson: e.target.value })
                    }
                    placeholder="John Doe"
                    className="text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Phone{" "}
                    <span className="text-slate-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    value={form.phone || ""}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      setErrors({ ...errors, phone: "" });
                    }}
                    placeholder="e.g. 0771234567"
                    className={fieldClass("phone")}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Email{" "}
                    <span className="text-slate-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <Input
                    value={form.email || ""}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    placeholder="vendor@email.com"
                    className={fieldClass("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Address{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <Input
                  value={form.address || ""}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="123 Main St, Colombo"
                  className="text-slate-900"
                />
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-200">
                <Button
                  type="submit"
                  className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                  disabled={submitting}
                >
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {submitting ? "Saving..." : "Add Vendor"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/vendors")}
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
