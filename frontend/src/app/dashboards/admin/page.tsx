"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Droplets,
  RefreshCw,
  Users,
} from "lucide-react";

import api from "@/lib/api";
import { getErrorMessage, getUserCountsApi, type UserCounts } from "@/lib/api/admin";
import { vehicleApi, type Vehicle } from "@/lib/api/vehicle";
import { maintenanceApi, type MaintenanceRequest } from "@/lib/api/maintenance";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import { queryKeys } from "@/lib/query-keys";

interface DashboardSnapshot {
  counts: UserCounts | null;
  vehicles: Vehicle[];
  trips: unknown[];
  maintenance: MaintenanceRequest[];
}

interface TripsListResponse {
  data?: unknown[];
}

const DEFAULT_SNAPSHOT: DashboardSnapshot = {
  counts: null,
  vehicles: [],
  trips: [],
  maintenance: [],
};

export default function AdminDashboardPage() {
  const {
    data: snapshot = DEFAULT_SNAPSHOT,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.adminDashboard,
    queryFn: async (): Promise<DashboardSnapshot> => {
      const [counts, vehicles, trips, maintenance] = await Promise.all([
        getUserCountsApi().catch(() => null),
        vehicleApi.getAll().then(r => r.data).catch(() => []),
        api
          .get<TripsListResponse>("/api/trips")
          .then((r) => (Array.isArray(r.data.data) ? r.data.data : []))
          .catch(() => []),
        maintenanceApi.getAll().then(r => r.data).catch(() => []),
      ]);

      return {
        counts,
        vehicles,
        trips,
        maintenance,
      };
    },
  });

  const errorMessage = error ? getErrorMessage(error) : null;
  const loading = isLoading;

  const dashboardCards = useMemo(() => {
    const counts = snapshot.counts;
    const activeMaintenance = snapshot.maintenance.filter(
      (req) => req.status === "SUBMITTED" || req.status === "NEW" || req.status === "APPROVED"
    ).length;

    return [
      {
        title: "Total Users",
        value: counts?.total ?? 0,
        subtitle: "Registered accounts",
        icon: Users,
        accent: "bg-white text-slate-950",
        iconAccent: "bg-blue-50 text-blue-600",
      },
      {
        title: "Fleet Size",
        value: snapshot.vehicles.length,
        subtitle: "Registered vehicles",
        icon: CheckCircle2,
        accent: "bg-white text-slate-950",
        iconAccent: "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Total Trips",
        value: snapshot.trips.length,
        subtitle: "Trip records",
        icon: Droplets, // Or maybe a route/car icon, but Droplets is already imported
        accent: "bg-white text-slate-950",
        iconAccent: "bg-sky-50 text-sky-600",
      },
      {
        title: "Active Maintenance",
        value: activeMaintenance,
        subtitle: "Open maintenance work",
        icon: AlertTriangle,
        accent: "bg-white text-slate-950",
        iconAccent: "bg-rose-50 text-rose-600",
      },
    ];
  }, [snapshot]);

  return (
    <div className="space-y-6">
        <PageHeader
          title="Admin Dashboard"
          description="System metrics and module access."
          icon={Users}
          actions={
            <>
              <Button
                variant="outline"
                size="icon"
                className="vfms-refresh-button"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh admin dashboard"
                title="Refresh admin dashboard"
              >
                <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              </Button>
              <Button asChild>
                <Link href="/admin/users">
                  Open User Management
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          }
        />

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <LoadingSpinner size={28} className="mx-auto text-slate-950" />
              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading dashboard overview...
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <FormMessage type="error" message={errorMessage} />
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboardCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className={`${card.accent} rounded-[24px] border border-slate-200 p-6 shadow-sm transition-transform hover:-translate-y-0.5`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                          {card.title}
                        </p>
                        <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                          {card.value}
                        </p>
                      </div>
                      <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconAccent}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      {card.subtitle}
                    </p>
                  </article>
                );
              })}
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/admin/users"
                className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">User Management</p>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/dashboards/fleet/vehicles"
                className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Vehicle Management</p>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/trips"
                className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Trip Operations</p>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/dashboards/fleet/maintenance"
                className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Maintenance</p>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/dashboards/fleet/rentals"
                className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Rentals</p>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/admin/fuel"
                className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Fuel Management</p>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/dashboards/fleet/vendors"
                className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Vendors</p>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="#"
                className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">System Reports</p>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
              <Link
                href="/settings/change-password"
                className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Security Settings</p>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            </section>
          </>
        )}
    </div>
  );
}
