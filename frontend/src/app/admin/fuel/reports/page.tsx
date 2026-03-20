"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, Download, RefreshCw } from "lucide-react";
import {
  getFilteredFuelRecordsApi,
  getErrorMessage,
  type FuelRecord,
} from "@/lib/api/fuel";
import {
  groupByVehicle,
  calcTotalLitres,
  calcTotalCost,
  calcAverageEfficiency,
  formatLKR,
} from "@/lib/fuel-utils";
import { AdminShell } from "@/components/layout/admin-shell";
import { FuelRecordsTable } from "@/components/fuel/fuel-records-table";
import { FuelSummaryCards } from "@/components/fuel/fuel-summary-cards";
import { FuelFilterBar } from "@/components/fuel/fuel-filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

export default function FuelReportsPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // In a real app these would come from APIs
  const vehicles: { id: string; label: string }[] = [];
  const drivers: { id: string; label: string }[] = [];

  const handleFilter = async (params: {
    from: string;
    to: string;
    vehicleId?: string;
    driverId?: string;
  }) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await getFilteredFuelRecordsApi(params);
      setRecords(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return;

    const headers = [
      "Date",
      "Vehicle",
      "Driver",
      "Quantity (L)",
      "Cost per L",
      "Total Cost",
      "Odometer",
      "Efficiency (km/L)",
      "Station",
      "Flagged",
    ];

    const rows = records.map((r) => [
      r.fuelDate,
      r.vehiclePlate || "-",
      r.driverName || "-",
      r.quantity.toString(),
      r.costPerLitre.toString(),
      formatLKR(r.totalCost),
      r.odometerReading?.toString() || "-",
      r.efficiencyKmPerLitre ? r.efficiencyKmPerLitre.toFixed(2) : "-",
      r.fuelStation || "-",
      r.flaggedForMisuse ? `Yes: ${r.flagReason}` : "No",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuel-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const vehicleBreakdown = groupByVehicle(records);

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="Fuel Reports"
          description="Filter and export fuel consumption data"
          icon={BarChart3}
          actions={
            records.length > 0 && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                           bg-slate-800 text-slate-200 font-medium text-sm
                           hover:bg-slate-700 transition-colors"
              >
                <Download size={14} />
                Export CSV
              </button>
            )
          }
        />

        {/* Filter Bar */}
        <FuelFilterBar
          vehicles={vehicles}
          drivers={drivers}
          onFilter={handleFilter}
          loading={loading}
        />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={28} className="text-amber-400" />
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : !hasSearched ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 size={32} className="text-slate-500 mb-3" />
            <h3 className="text-lg font-semibold text-slate-200 mb-1">
              No filters applied
            </h3>
            <p className="text-sm text-slate-400">
              Select filters above to generate a report
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 size={32} className="text-slate-500 mb-3" />
            <h3 className="text-lg font-semibold text-slate-200 mb-1">
              No records found
            </h3>
            <p className="text-sm text-slate-400">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <FuelSummaryCards records={records} />

            {/* Vehicle Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800">
                <h3 className="font-semibold text-slate-200">Vehicle Breakdown</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {Object.entries(vehicleBreakdown).map(([plate, vehicleRecords]) => (
                  <div
                    key={plate}
                    className="grid grid-cols-6 gap-4 p-4 text-sm
                             hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="text-slate-200 font-medium">{plate}</div>
                    <div className="text-slate-400">
                      {vehicleRecords.length} entries
                    </div>
                    <div className="text-slate-400">
                      {calcTotalLitres(vehicleRecords).toFixed(2)} L
                    </div>
                    <div className="text-slate-400">
                      {formatLKR(calcTotalCost(vehicleRecords))}
                    </div>
                    <div className="text-slate-400">
                      {(() => {
                        const avg = calcAverageEfficiency(vehicleRecords);
                        return avg ? `${avg.toFixed(2)} km/L` : "—";
                      })()}
                    </div>
                    <div className="text-right text-slate-400">
                      {vehicleRecords.filter((r) => r.flaggedForMisuse).length} flagged
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Records Table */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-200">All Records</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <FuelRecordsTable records={records} />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
