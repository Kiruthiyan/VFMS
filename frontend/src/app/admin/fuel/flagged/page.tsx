"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getFlaggedFuelRecordsApi, getErrorMessage, type FuelRecord } from "@/lib/api/fuel";
import { AdminShell } from "@/components/layout/admin-shell";
import { FuelRecordsTable } from "@/components/fuel/fuel-records-table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

export default function FlaggedFuelPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlaggedRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFlaggedFuelRecordsApi();
      setRecords(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFlaggedRecords(); }, [fetchFlaggedRecords]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="Flagged Fuel Records"
          description="Entries flagged for misuse review"
          icon={AlertTriangle}
          iconClassName="text-red-500"
          actions={
            <button
              onClick={fetchFlaggedRecords}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          }
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={28} className="text-amber-400" />
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle size={32} className="text-slate-500 mb-3" />
            <h3 className="text-lg font-semibold text-slate-200 mb-1">
              No flagged records
            </h3>
            <p className="text-sm text-slate-400">
              All fuel entries have passed integrity checks
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <FuelRecordsTable records={records} />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
