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
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { canAdmin } = useRole();
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
    <div className="vfms-detail-page">
      <div className="vfms-detail-container animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboards/fleet/vendors")}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vendors
        </Button>

        <Card className="vfms-detail-card">
          <CardHeader className="vfms-form-header px-6 py-5 pl-8">
            <CardTitle className="flex flex-col gap-3 text-white text-lg sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-blue-950">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="min-w-0 truncate">{vendor.name}</span>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="vfms-detail-tile">
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
              <div className="vfms-detail-tile">
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
              <div className="vfms-detail-tile">
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
              <div className="vfms-detail-tile">
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
              {canAdmin && (
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboards/fleet/vendors/${vendor.id}/edit`)
                  }
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Vendor
                </Button>
              )}
              {canAdmin && (
                <Button
                  variant={vendor.active ? "destructive" : "success"}
                  onClick={handleToggleStatus}
                  disabled={toggling}
                >
                  <Power className="mr-2 h-4 w-4" />
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
