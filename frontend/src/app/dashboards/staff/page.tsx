"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, Droplets, ShieldCheck, UserRound } from "lucide-react";
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

export default function StaffDashboardPage() {
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
    const activeMaintenance = snapshot.maintenance.filter(
      (req) => req.status === "SUBMITTED" || req.status === "NEW" || req.status === "APPROVED"
    ).length;
    const completedTrips = snapshot.trips.filter((trip) => trip.status === "COMPLETED").length;

    return [
      {
        title: "My Trips",
        value: snapshot.trips.length,
        description: "Trip requests connected to your account",
        icon: ClipboardList,
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
        title: "Completed Trips",
        value: completedTrips,
        description: "Your completed trip requests",
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
          title="Staff Dashboard"
          description="Request trips, manage your trips, vehicle registry, maintenance requests, vehicle rentals, vendors, and personal profile from one consistent workspace."
          icon={UserRound}
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Workflow Focus
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">Built for request flows</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    This staff workspace provides immediate access to vehicle requests, maintenance logs, and operational tools designed for clarity and quick completion.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Upcoming modules
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Simple request creation with strong form clarity",
                  "Clear history and request status tracking",
                  "Personal profile and security access from one place",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-amber-300" />
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Link
              href="/trips/create"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Request Trip</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Submit a new trip or vehicle request.</p>
            </Link>
            <Link
              href="/trips/requester"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">My Trips</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Track all your trip requests and their status.</p>
            </Link>
            <Link
              href="/dashboards/fleet/vehicles"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Vehicle Registry</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">View all available vehicles and current status.</p>
            </Link>
            <Link
              href="/dashboards/fleet/maintenance"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Maintenance</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Submit and track vehicle repair requests.</p>
            </Link>
            <Link
              href="/dashboards/fleet/rentals"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Vehicle Rentals</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Review rental vehicle activity.</p>
            </Link>
            <Link
              href="/dashboards/fleet/vendors"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Vendors</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Access registered third-party service providers.</p>
            </Link>
            <Link
              href="/dashboards/staff/profile"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">My Profile</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Update your personal and contact details.</p>
            </Link>
            <Link
              href="/settings/change-password"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Security Settings</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Update your credentials and secure session.</p>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
