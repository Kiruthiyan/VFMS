"use client";

import { useEffect, useState, useCallback } from "react";
import { Fuel, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  getAllFuelRecordsApi,
  getFilteredFuelRecordsApi,
  getErrorMessage,
  type FuelRecord,
} from "@/lib/api/fuel";
import { AdminShell } from "@/components/layout/admin-shell";
import { FuelRecordsTable } from "@/components/fuel/fuel-records-table";
import { FuelSummaryCards } from "@/components/fuel/fuel-summary-cards";
import { FuelFilterBar } from "@/components/fuel/fuel-filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

export default function FuelManagementPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app these would come from vehicle/driver APIs
  const vehicles: { id: string; label: string }[] = [];
  const drivers: { id: string; label: string }[] = [];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllFuelRecordsApi();
      setRecords(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleFilter = async (params: {
    from: string;
    to: string;
    vehicleId?: string;
    driverId?: string;
  }) => {
    setFiltering(true);
    setError(null);
    try {
      const data = await getFilteredFuelRecordsApi(params);
      setRecords(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFiltering(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="Fuel Management"
          description={`${records.length} records`}
          icon={Fuel}
          actions={
            <div className="flex items-center gap-3">
              <button
                onClick={fetchAll}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <Link
                href="/admin/fuel/add"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                           bg-amber-500 text-slate-900 font-bold text-sm
                           hover:bg-amber-400 transition-colors"
              >
                <Plus size={14} />
                Add Entry
              </Link>
            </div>
          }
        />

        {/* Summary Cards */}
        <FuelSummaryCards records={records} />

        {/* Filter Bar */}
        <FuelFilterBar
          vehicles={vehicles}
          drivers={drivers}
          onFilter={handleFilter}
          loading={filtering}
        />

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={28} className="text-amber-400" />
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <FuelRecordsTable records={records} />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
