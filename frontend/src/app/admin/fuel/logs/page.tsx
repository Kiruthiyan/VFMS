"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  getAllFuelRecordsApi,
  getFilteredFuelRecordsApi,
  getErrorMessage,
  extractUniqVehicles,
  extractUniqueDrivers,
  type FuelRecord,
} from "@/lib/api/fuel";
import { AdminShell } from "@/components/layout/admin-shell";
import { FuelRecordsTable } from "@/components/fuel/fuel-records-table";
import { FuelFilterBar } from "@/components/fuel/fuel-filter-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FuelEntryLogsPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehicles = extractUniqVehicles(records);
  const drivers = extractUniqueDrivers(records);

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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Fuel Entry Logs</h1>
              <p className="text-slate-600 text-sm font-medium">View and filter all fuel entry records in your fleet</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 h-fit">
              <Link
                href="/admin/fuel/create"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95 whitespace-nowrap"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>New Entry</span>
              </Link>
              <button
                onClick={fetchAll}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 whitespace-nowrap"
              >
                <RefreshCw size={18} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <FuelFilterBar
              vehicles={vehicles}
              drivers={drivers}
              onFilter={handleFilter}
              loading={filtering}
            />
          </div>

          {/* Records Table Section */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="text-center">
                <LoadingSpinner size={32} className="text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 font-500">Loading fuel records...</p>
              </div>
            </div>
          ) : error ? (
            <FormMessage type="error" message={error} />
          ) : records.length === 0 ? (
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200 text-center py-16">
              <CardContent>
                <p className="text-slate-600 font-500 mb-4">No fuel records found</p>
                <Link
                  href="/admin/fuel/create"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm transition-all"
                >
                  <Plus size={16} />
                  Create First Entry
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <CardHeader className="bg-blue-950 py-4 border-b border-slate-200">
                <CardTitle className="text-white font-bold text-base">
                  All Fuel Records ({records.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <FuelRecordsTable records={records} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
