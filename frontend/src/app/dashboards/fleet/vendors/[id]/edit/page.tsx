"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Resolver, useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { vendorApi, Vendor, VendorFormData } from "@/lib/api/rental";
import { vendorFormSchema } from "@/lib/validators/fleet-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditVendorPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorFormSchema) as Resolver<VendorFormData>,
    defaultValues: {
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    vendorApi
      .getById(Number(id))
      .then((res) => {
        const v: Vendor = res.data;
        reset({
          name: v.name,
          contactPerson: v.contactPerson,
          phone: v.phone,
          email: v.email,
          address: v.address,
        });
      })
      .catch(() => toast.error("Failed to load vendor"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const fieldClass = (field: keyof VendorFormData) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  const onSubmit = async (data: VendorFormData) => {
    try {
      await vendorApi.update(Number(id), data);
      toast.success("Vendor updated successfully");
      router.push(`/dashboards/fleet/vendors/${id}`);
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
          onClick={() => router.push(`/dashboards/fleet/vendors/${id}`)}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendor
        </Button>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <CardHeader className="vfms-form-header py-5 pl-8">
            <CardTitle className="flex items-center gap-3 text-white text-lg">
              <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                <Building2 className="h-5 w-5" />
              </div>
              Edit Vendor
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="vfms-form-section">
                <h3 className="vfms-form-section-title">
                  <span className="vfms-form-step">1</span>
                  Vendor Information
                </h3>
                <div className="space-y-4">
                  <div className="vfms-form-section-grid">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Vendor Name *
                      </label>
                      <Input
                        {...register("name")}
                        placeholder="City Rentals"
                        className={fieldClass("name")}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name.message}
                        </p>
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
                        {...register("contactPerson")}
                        placeholder="John Doe"
                        className="text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="vfms-form-section-grid">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                        Phone{" "}
                        <span className="text-slate-400 font-normal">
                          (Optional)
                        </span>
                      </label>
                      <Input
                        {...register("phone")}
                        placeholder="e.g. 0771234567"
                        className={fieldClass("phone")}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone.message}
                        </p>
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
                        {...register("email")}
                        placeholder="vendor@email.com"
                        className={fieldClass("email")}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Address{" "}
                      <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <Input
                      {...register("address")}
                      placeholder="123 Main St, Colombo"
                      className="text-slate-900"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-200">
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
                  onClick={() => router.push(`/dashboards/fleet/vendors/${id}`)}
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
