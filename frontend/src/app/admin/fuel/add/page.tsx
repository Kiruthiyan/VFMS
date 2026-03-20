"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Fuel } from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FuelEntryForm } from "@/components/fuel/fuel-entry-form";
import { PageHeader } from "@/components/ui/page-header";

export default function AddFuelPage() {
  const router = useRouter();

  // In a real app these would be fetched from APIs
  const vehicles: { id: string; label: string }[] = [];
  const drivers: { id: string; label: string }[] = [];

  const handleSuccess = () => {
    router.push("/admin/fuel");
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/fuel"
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        </div>

        <PageHeader
          title="Add Fuel Entry"
          description="Record a new fuel purchase for your vehicle"
          icon={Fuel}
        />

        <div className="max-w-2xl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <FuelEntryForm
              vehicles={vehicles}
              drivers={drivers}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
