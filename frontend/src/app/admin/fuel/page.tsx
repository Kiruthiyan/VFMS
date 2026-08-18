"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Droplets,
  FileText,
  Fuel,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { FuelManagementNav } from "@/components/admin/fuel/fuel-management-nav";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getAllFuelRecordsApi,
  getErrorMessage,
} from "@/lib/api/fuel";
import { queryKeys } from "@/lib/query-keys";

export default function FuelDashboardPage() {
  const {
    data: records = [],
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: queryKeys.fuelRecords,
    queryFn: getAllFuelRecordsApi,
  });
  const errorMessage = error ? getErrorMessage(error) : null;

  const totalSpend = records.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const totalVolume = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const avgCostPerLiter =
    totalVolume > 0 ? (totalSpend / totalVolume).toFixed(2) : "0.00";

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

  return (
      <div className="space-y-6">
        <PageHeader
          title="Fuel Management"
          description="Track fuel records, cost, volume, and flagged activity."
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

        <FuelManagementNav />

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

        {errorMessage && !loading && <FormMessage type="error" message={errorMessage} />}

        {!loading && !errorMessage && (
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
          </>
        )}
      </div>
  );
}
