"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Resolver, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api";
import { vendorApi, VendorFormData } from "@/lib/api/rental";
import { vendorFormSchema } from "@/lib/validators/fleet-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function AddVendorPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
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

  const fieldClass = (field: keyof VendorFormData) =>
    `text-slate-900 ${errors[field] ? "border-red-400 focus:ring-red-400" : ""}`;

  const onSubmit = async (data: VendorFormData) => {
    try {
      await vendorApi.create(data);
      toast.success("Vendor added successfully");
      router.push("/dashboards/fleet/vendors");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboards/fleet/vendors")}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors
        </Button>

        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-0 gap-0 pb-4">
          <CardHeader className="vfms-form-header py-5 pl-8">
            <CardTitle className="flex items-center gap-3 text-white text-lg">
              <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                <Building2 className="h-5 w-5" />
              </div>
              Add New Vendor
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
              <div className="flex gap-3 pt-3 border-t border-slate-200">
                <Button
                  type="submit"
                  className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {isSubmitting ? "Saving..." : "Add Vendor"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboards/fleet/vendors")}
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
