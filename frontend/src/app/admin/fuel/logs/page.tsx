"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Filter, Plus, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  getAllFuelRecordsApi,
  getFilteredFuelRecordsApi,
  getErrorMessage,
  extractUniqVehicles,
  extractUniqueDrivers,
} from "@/lib/api/fuel";
import { queryKeys } from "@/lib/query-keys";

import { FuelRecordsTable } from "@/components/fuel/fuel-records-table";
import { FuelFilterBar } from "@/components/fuel/fuel-filter-bar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FuelEntryLogsPage() {
  const [filterParams, setFilterParams] = useState<{
    from: string;
    to: string;
    vehicleId?: string;
    driverId?: string;
  } | null>(null);
  const [filtering, setFiltering] = useState(false);
  const {
    data: records = [],
    error,
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: filterParams ? [...queryKeys.fuelRecords, "filtered", filterParams] : queryKeys.fuelRecords,
    queryFn: () => filterParams ? getFilteredFuelRecordsApi(filterParams) : getAllFuelRecordsApi(),
  });
  const errorMessage = error ? getErrorMessage(error) : null;

  const vehicles = extractUniqVehicles(records);
  const drivers = extractUniqueDrivers(records);

  const handleFilter = async (params: {
    from: string;
    to: string;
    vehicleId?: string;
    driverId?: string;
  }) => {
    setFiltering(true);
    setFilterParams(params);
    window.setTimeout(() => {
      setFiltering(false);
    }, 0);
  };

  return (

      <div className="space-y-6">
        <div>
          <Button
            asChild
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 -ml-4"
          >
            <Link href="/admin/fuel">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Fuel Dashboard
            </Link>
          </Button>
        </div>

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
              <Button
                variant="outline"
                size="icon"
                className="vfms-refresh-button"
                onClick={() => {
                  setFilterParams(null);
                  void refetch();
                }}
                disabled={isFetching}
                aria-label="Refresh fuel logs"
                title="Refresh fuel logs"
              >
                <RefreshCw
                  size={16}
                  className={isFetching ? "animate-spin" : ""}
                />
              </Button>
            </>
          }
        />

        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="vfms-card-header px-6 py-5 pl-8">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-950">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                <Filter size={20} strokeWidth={2.1} />
              </span>
              <span>
                Filter Fuel Records
                <span className="mt-1 block text-sm font-medium leading-6 text-slate-500">
                  Refine the registry by date, vehicle, or driver.
                </span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <FuelFilterBar
              vehicles={vehicles}
              drivers={drivers}
              onFilter={handleFilter}
              loading={filtering}
            />
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="text-center">
              <LoadingSpinner size={32} className="mx-auto mb-4 text-slate-950" />
              <p className="text-sm font-medium text-slate-600">
                Loading fuel records...
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <FormMessage type="error" message={errorMessage} />
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
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="vfms-card-header flex items-center justify-between px-6 py-5 pl-8">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-950">
                    Fuel Registry
                  </CardTitle>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    All Fuel Records ({records.length})
                  </p>
                </div>
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
