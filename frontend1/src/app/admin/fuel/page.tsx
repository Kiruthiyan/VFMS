"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Droplets,
  FileText,
  Fuel,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  extractUniqVehicles,
  extractUniqueDrivers,
  getAllFuelRecordsApi,
  getErrorMessage,
  type FuelRecord,
} from "@/lib/api/fuel";

export default function FuelDashboardPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vehicles = extractUniqVehicles(records);
  const drivers = extractUniqueDrivers(records);
  const totalSpend = records.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const totalVolume = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const avgCostPerLiter =
    totalVolume > 0 ? (totalSpend / totalVolume).toFixed(2) : "0.00";

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

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const statCards = [
    {
      label: "Total Records",
      value: records.length.toString(),
      detail: "Fuel entries tracked",
      icon: Fuel,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
    },
    {
      label: "Total Spend",
      value: `LKR ${(totalSpend / 1000).toFixed(1)}k`,
      detail: "Total fuel cost",
      icon: TrendingUp,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    {
      label: "Total Volume",
      value: `${totalVolume.toFixed(0)}L`,
      detail: "Liters dispensed",
      icon: Droplets,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
    },
    {
      label: "Avg Cost/L",
      value: `LKR ${avgCostPerLiter}`,
      detail: "Cost per liter",
      icon: BarChart3,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-700",
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="Fuel Management"
          description="Monitor fuel usage, operating cost, and fleet activity from one consistent workspace."
          icon={Fuel}
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/admin/fuel/logs">
                  <FileText size={16} />
                  View Logs
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/fuel/create">
                  <Plus size={16} />
                  New Entry
                </Link>
              </Button>
            </>
          }
        />

        {loading && (
          <div className="flex justify-center py-24">
            <div className="text-center">
              <LoadingSpinner size={32} className="mx-auto mb-4 text-slate-950" />
              <p className="text-sm font-medium text-slate-600">
                Loading dashboard data...
              </p>
            </div>
          </div>
        )}

        {error && !loading && <FormMessage type="error" message={error} />}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.label}
                    className="rounded-2xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {card.label}
                          </p>
                          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                            {card.value}
                          </p>
                        </div>
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
                        >
                          <Icon
                            size={18}
                            className={card.iconColor}
                            strokeWidth={2.2}
                          />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.detail}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/fuel/logs" className="group">
                <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 transition-colors group-hover:bg-amber-100">
                        <FileText
                          size={22}
                          className="text-slate-950"
                          strokeWidth={1.5}
                        />
                      </div>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        VIEW
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-bold text-slate-900">
                      Fuel Entry Logs
                    </h3>
                    <p className="text-xs text-slate-600">
                      View and filter all fuel entry records with details.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/fuel/create" className="group">
                <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 transition-colors group-hover:bg-amber-100">
                        <Plus
                          size={22}
                          className="text-slate-950"
                          strokeWidth={2.5}
                        />
                      </div>
                      <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                        NEW
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-bold text-slate-900">
                      Create Fuel Entry
                    </h3>
                    <p className="text-xs text-slate-600">
                      Log a new fuel purchase for your fleet.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/fuel/alerts" className="group">
                <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 transition-colors group-hover:bg-amber-100">
                        <AlertCircle
                          size={22}
                          className="text-slate-950"
                          strokeWidth={1.5}
                        />
                      </div>
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                        MONITOR
                      </span>
                    </div>
                    <h3 className="mb-1 text-sm font-bold text-slate-900">
                      Fuel Alerts
                    </h3>
                    <p className="text-xs text-slate-600">
                      Review flagged records and suspicious patterns.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <CardTitle className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-950">
                    <Fuel size={18} className="text-amber-700" />
                    Fleet Overview
                  </CardTitle>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span className="text-sm font-medium text-slate-700">
                        Active Vehicles
                      </span>
                      <span className="text-2xl font-bold text-slate-950">
                        {vehicles.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Active Drivers
                      </span>
                      <span className="text-2xl font-bold text-slate-950">
                        {drivers.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <CardTitle className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-950">
                    <BarChart3 size={18} className="text-amber-700" />
                    Quick Stats
                  </CardTitle>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <span className="text-sm font-medium text-slate-700">
                        Records per Vehicle
                      </span>
                      <span className="text-2xl font-bold text-slate-950">
                        {vehicles.length > 0
                          ? (records.length / vehicles.length).toFixed(1)
                          : "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Avg Spend per Vehicle
                      </span>
                      <span className="text-lg font-bold text-slate-950">
                        LKR{" "}
                        {vehicles.length > 0
                          ? (totalSpend / vehicles.length).toFixed(0)
                          : "0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
