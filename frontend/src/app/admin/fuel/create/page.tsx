"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { FuelEntryForm } from "@/components/fuel/fuel-entry-form";
import { PageHeader } from "@/components/ui/page-header";

export default function CreateFuelEntryPage() {
  const router = useRouter();

  // In a real app these would be fetched from APIs
  const vehicles: { id: string; label: string }[] = [];
  const drivers: { id: string; label: string }[] = [];

  const handleSuccess = () => {
    router.push("/admin/fuel");
  };

  return (
    <AdminShell>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/admin/fuel"
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-medium transition-colors"
            >
              <ArrowLeft size={15} />
              Fuel Management
            </Link>
            <span className="text-slate-400 text-xs">/</span>
            <span className="text-slate-700 text-xs font-medium">Create Entry</span>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <PageHeader
              title="Create Fuel Entry"
              description="Record a new fuel purchase for your vehicle fleet"
              icon={Plus}
            />
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-blue-950 px-8 py-5 border-b border-slate-200">
              <h2 className="text-base font-bold text-white">Fuel Entry Details</h2>
            </div>
            <div className="p-8">
              <FuelEntryForm
                vehicles={vehicles}
                drivers={drivers}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
