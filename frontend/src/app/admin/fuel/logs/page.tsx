"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  getAllFuelRecordsApi,
  getFilteredFuelRecordsApi,
  getErrorMessage,
  extractUniqVehicles,
  extractUniqueDrivers,
  type FuelRecord,
} from "@/lib/api/fuel";

import { FuelRecordsTable } from "@/components/fuel/fuel-records-table";
import { FuelFilterBar } from "@/components/fuel/fuel-filter-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

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

      <div className="space-y-6">
        <PageHeader
          title="Fuel Entry Logs"
          description="Browse, filter, and review fuel records using one consistent data-friendly layout."
          icon={FileText}
          actions={
            <>
              <Button asChild>
                <Link href="/admin/fuel/create">
                  <Plus size={16} />
                  New Entry
                </Link>
              </Button>
              <Button variant="outline" onClick={fetchAll} disabled={loading}>
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </Button>
            </>
          }
        />

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Filter Records
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
              Narrow the fuel record list
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Refine the table by date, vehicle, or driver without leaving the logs workspace.
            </p>
          </div>
          <div className="mt-5">
            <FuelFilterBar
              vehicles={vehicles}
              drivers={drivers}
              onFilter={handleFilter}
              loading={filtering}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="text-center">
              <LoadingSpinner size={32} className="mx-auto mb-4 text-slate-950" />
              <p className="text-sm font-medium text-slate-600">
                Loading fuel records...
              </p>
            </div>
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : records.length === 0 ? (
          <Card className="rounded-[28px] py-16 text-center shadow-sm">
            <CardContent>
              <p className="mb-4 text-sm font-medium text-slate-600">
                No fuel records found
              </p>
              <Button asChild variant="secondary">
                <Link href="/admin/fuel/create">
                  <Plus size={16} />
                  Create First Entry
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-[28px] shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <CardTitle className="text-base font-semibold text-slate-950">
                  All Fuel Records ({records.length})
                </CardTitle>
              </div>
              <div className="overflow-x-auto">
                <FuelRecordsTable records={records} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

  );
}
