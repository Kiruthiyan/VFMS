"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { vendorApi, Vendor } from "@/lib/api/rental";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Power,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { canCreate, canAdmin } = useRole();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const fetchVendor = async () => {
    try {
      const res = await vendorApi.getById(Number(id));
      setVendor(res.data);
    } catch {
      toast.error("Failed to fetch vendor");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!vendor) return;
    const action = vendor.active ? "Deactivate" : "Activate";
    if (!confirm(`${action} this vendor?`)) return;
    setToggling(true);
    try {
      await vendorApi.toggleStatus(vendor.id);
      toast.success(`Vendor ${action.toLowerCase()}d`);
      fetchVendor();
    } catch {
      toast.error("Failed to update vendor status");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-400">Vendor not found</p>
      </div>
    );
  }

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

        <Card className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-hidden">
          <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white text-lg">
                <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                  <Building2 className="h-5 w-5" />
                </div>
                {vendor.name}
              </div>
              <span
                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                  vendor.active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {vendor.active ? "Active" : "Inactive"}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Contact Person</p>
                  <p className="font-semibold text-slate-900">
                    {vendor.contactPerson || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 mt-0.5">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="font-semibold text-slate-900">
                    {vendor.phone || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 mt-0.5">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="font-semibold text-slate-900">
                    {vendor.email || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl ring-1 ring-slate-100 shadow-sm">
                <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Address</p>
                  <p className="font-semibold text-slate-900">
                    {vendor.address || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 mt-2 border-t border-slate-200 flex-wrap">
              {canCreate && (
                <Button
                  className="bg-blue-950 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  onClick={() =>
                    router.push(`/dashboard/vendors/${vendor.id}/edit`)
                  }
                >
                  Edit Vendor
                </Button>
              )}
              {canAdmin && (
                <Button
                  className={
                    vendor.active
                      ? "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                      : "border-emerald-300 text-emerald-600 hover:bg-emerald-50 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                  }
                  variant={vendor.active ? "default" : "outline"}
                  onClick={handleToggleStatus}
                  disabled={toggling}
                >
                  <Power className="h-4 w-4 mr-2" />
                  {toggling
                    ? "Updating..."
                    : vendor.active
                      ? "Deactivate Vendor"
                      : "Activate Vendor"}
                </Button>
              )}
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
