"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Droplets,
  FileText,
  Flag,
  Fuel,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

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
    },
    {
      label: "Total Spend",
      value: `LKR ${(totalSpend / 1000).toFixed(1)}k`,
      detail: "Total fuel cost",
      icon: TrendingUp,
    },
    {
      label: "Total Volume",
      value: `${totalVolume.toFixed(0)}L`,
      detail: "Liters dispensed",
      icon: Droplets,
    },
    {
      label: "Avg Cost/L",
      value: `LKR ${avgCostPerLiter}`,
      detail: "Cost per liter",
      icon: BarChart3,
    },
  ];

  const operationCards = [
    {
      title: "Fuel Logs",
      description: "View and filter every fuel transaction recorded.",
      href: "/admin/fuel/logs",
      icon: FileText,
      action: "View",
    },
    {
      title: "New Fuel Entry",
      description: "Record a new fuel purchase for the fleet.",
      href: "/admin/fuel/create",
      icon: Plus,
      action: "Create",
    },
    {
      title: "Fuel Alerts",
      description: "Review unusual usage and suspicious patterns.",
      href: "/admin/fuel/alerts",
      icon: AlertCircle,
      action: "Review",
    },
    {
      title: "Flagged Records",
      description: "Open records that need operational follow-up.",
      href: "/admin/fuel/alerts/flagged",
      icon: Flag,
      action: "Resolve",
    },
  ];

  return (
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
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {card.label}
                          </p>
                          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                            {card.value}
                          </p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                          <Icon
                            size={18}
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

            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="vfms-card-header flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-950">
                    <Fuel className="text-amber-600" size={22} />
                    Fuel Operations
                  </CardTitle>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Common fuel workflows are available here without crowding the sidebar.
                  </p>
                </div>
              </div>
              <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
                {operationCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-200 hover:bg-slate-50 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-100">
                          <Icon size={20} strokeWidth={2.1} />
                        </div>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                          {card.action}
                        </span>
                      </div>
                      <h3 className="mt-4 text-base font-bold text-slate-950">
                        {card.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {card.description}
                      </p>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="vfms-card-header px-6 py-5">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <Fuel size={18} className="text-amber-700" />
                    Fleet Overview
                  </CardTitle>
                </div>
                <CardContent className="p-6">
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

              <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="vfms-card-header px-6 py-5">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-950">
                    <BarChart3 size={18} className="text-amber-700" />
                    Quick Stats
                  </CardTitle>
                </div>
                <CardContent className="p-6">
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
  );
}
