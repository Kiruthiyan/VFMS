"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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

interface DashboardSnapshot {
  counts: UserCounts | null;
  vehicles: Vehicle[];
  trips: any[];
  maintenance: MaintenanceRequest[];
}

const DEFAULT_SNAPSHOT: DashboardSnapshot = {
  counts: null,
  vehicles: [],
  trips: [],
  maintenance: [],
};

export default function AdminDashboardPage() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(DEFAULT_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [counts, vehicles, trips, maintenance] = await Promise.all([
        getUserCountsApi().catch(() => null),
        vehicleApi.getAll().then(r => r.data).catch(() => []),
        api.get("/api/trips").then((r: any) => r.data.data || []).catch(() => []),
        maintenanceApi.getAll().then(r => r.data).catch(() => []),
      ]);

      setSnapshot({
        counts,
        vehicles,
        trips,
        maintenance,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboardCards = useMemo(() => {
    const counts = snapshot.counts;
    const activeMaintenance = snapshot.maintenance.filter(
      (req) => req.status === "SUBMITTED" || req.status === "NEW" || req.status === "APPROVED"
    ).length;

    return [
      {
        title: "Total Users",
        value: counts?.total ?? 0,
        subtitle: "Across all active and archived accounts",
        icon: Users,
        accent: "bg-white text-slate-950",
        iconAccent: "bg-blue-50 text-blue-600",
      },
      {
        title: "Fleet Size",
        value: snapshot.vehicles.length,
        subtitle: "Total registered vehicles in the system",
        icon: CheckCircle2,
        accent: "bg-white text-slate-950",
        iconAccent: "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Total Trips",
        value: snapshot.trips.length,
        subtitle: "All recorded trip requests and histories",
        icon: Droplets, // Or maybe a route/car icon, but Droplets is already imported
        accent: "bg-white text-slate-950",
        iconAccent: "bg-sky-50 text-sky-600",
      },
      {
        title: "Active Maintenance",
        value: activeMaintenance,
        subtitle: "Vehicles currently requiring attention",
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
          description="Manage users, vehicles, maintenance, rentals, trips, reports, fuel, and system workflows from one consistent FleetPro workspace."
          icon={Users}
          actions={
            <>
              <Button
                variant="outline"
                size="icon"
                className="vfms-refresh-button"
                onClick={loadDashboard}
                disabled={loading}
                aria-label="Refresh admin dashboard"
                title="Refresh admin dashboard"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
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
        ) : error ? (
          <FormMessage type="error" message={error} />
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

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
              <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
                    <Users className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Admin Workspace
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-950">
                      System-wide control
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      This administrative workspace provides a clean, unified view of all system modules. Manage users, monitor fleet activity, oversee trip operations, and track maintenance from one consistent hub.
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                  Key Capabilities
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    "Complete oversight of registered vehicles and fleet status",
                    "Manage user accounts, roles, and access permissions",
                    "Monitor global trip activity and request volumes",
                    "Track maintenance schedules and vehicle downtime",
                    "Review flagged fuel transactions and system anomalies",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-300" />
                      <p className="text-sm text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/admin/users"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">User Management</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Create user accounts, update roles, and manage account status.</p>
              </Link>
              <Link
                href="/dashboards/fleet/vehicles"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Vehicle Management</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Maintain vehicle registry, monitor status, and track mileage.</p>
              </Link>
              <Link
                href="/trips"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Trip Operations</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Approve trip requests, track journeys, and view histories.</p>
              </Link>
              <Link
                href="/dashboards/fleet/maintenance"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Maintenance</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Schedule services, track repair histories, and approve requests.</p>
              </Link>
              <Link
                href="/dashboards/fleet/rentals"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Rentals</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Manage rental assignments, external costs, and returned vehicles.</p>
              </Link>
              <Link
                href="/admin/fuel"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Fuel Management</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Monitor entries, inspect logs, and review flagged activity.</p>
              </Link>
              <Link
                href="/dashboards/fleet/vendors"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Vendors</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Oversee third-party service providers and rental companies.</p>
              </Link>
              <Link
                href="#"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">System Reports</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Generate analytics and detailed exports across all modules.</p>
              </Link>
              <Link
                href="/settings/change-password"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">Security Settings</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Update admin credentials and keep session access secure.</p>
              </Link>
            </section>
          </>
        )}
    </div>
  );
}
