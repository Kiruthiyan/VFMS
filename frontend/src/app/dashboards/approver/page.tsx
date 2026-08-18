"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Droplets, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import api from "@/lib/api";
import { vehicleApi, type Vehicle } from "@/lib/api/vehicle";
import { maintenanceApi, type MaintenanceRequest } from "@/lib/api/maintenance";

interface DashboardTrip {
  id?: string;
  status?: string;
}

interface DashboardSnapshot {
  vehicles: Vehicle[];
  trips: DashboardTrip[];
  maintenance: MaintenanceRequest[];
}

const DEFAULT_SNAPSHOT: DashboardSnapshot = {
  vehicles: [],
  trips: [],
  maintenance: [],
};

function readTripArray(payload: unknown): DashboardTrip[] {
  if (Array.isArray(payload)) {
    return payload as DashboardTrip[];
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    return Array.isArray(nested) ? (nested as DashboardTrip[]) : [];
  }
  return [];
}

export default function ApproverDashboardPage() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(DEFAULT_SNAPSHOT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [vehicles, trips, maintenance] = await Promise.all([
          vehicleApi.getAll().then(r => r.data).catch(() => []),
          api.get<unknown>("/api/trips").then((r) => readTripArray(r.data)).catch(() => []),
          maintenanceApi.getAll().then(r => r.data).catch(() => []),
        ]);
        setSnapshot({ vehicles, trips, maintenance });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    const pendingTrips = snapshot.trips.filter((trip) => trip.status === "SUBMITTED").length;
    const activeMaintenance = snapshot.maintenance.filter(
      (req) => req.status === "SUBMITTED" || req.status === "NEW" || req.status === "APPROVED"
    ).length;

    return [
      {
        title: "Pending Trips",
        value: pendingTrips,
        description: "Trip requests waiting for review",
        icon: Users,
        iconAccent: "bg-blue-50 text-blue-600",
      },
      {
        title: "Fleet Size",
        value: snapshot.vehicles.length,
        description: "Total registered vehicles in the system",
        icon: CheckCircle2,
        iconAccent: "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Total Trips",
        value: snapshot.trips.length,
        description: "All recorded trip requests and histories",
        icon: Droplets,
        iconAccent: "bg-sky-50 text-sky-600",
      },
      {
        title: "Active Maintenance",
        value: activeMaintenance,
        description: "Vehicles currently requiring attention",
        icon: AlertTriangle,
        iconAccent: "bg-rose-50 text-rose-600",
      },
    ];
  }, [snapshot]);

  return (
    <div className="space-y-6">
        <PageHeader
          title="Approver Dashboard"
          description="Review and manage trip requests, driver profiles, leave requests, infractions, maintenance approvals, vehicle registry, and rentals from one consistent workspace."
          icon={Users}
        />

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <LoadingSpinner size={28} className="text-slate-950" />
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5"
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
                    <card.icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  {card.description}
                </p>
              </article>
            ))}
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Link
              href="/trips"
              className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Trip Requests</p>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/drivers"
              className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Drivers</p>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/drivers/leave-requests"
              className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Leave Requests</p>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/drivers/infractions"
              className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Infractions</p>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/dashboards/fleet/maintenance?status=SUBMITTED"
              className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Maintenance Approvals</p>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/dashboards/fleet/maintenance"
              className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">All Maintenance</p>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/dashboards/fleet/vehicles"
              className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Vehicle Registry</p>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
            <Link
              href="/dashboards/fleet/rentals"
              className="flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Vehicle Rentals</p>
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
