"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  UserCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
  AlertTriangle,
  Droplets,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import api from "@/lib/api";
import { getUserCountsApi, type UserCounts } from "@/lib/api/admin";
import { vehicleApi, type Vehicle } from "@/lib/api/vehicle";
import { maintenanceApi, type MaintenanceRequest } from "@/lib/api/maintenance";

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

export default function DriverDashboardPage() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(DEFAULT_SNAPSHOT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [counts, vehicles, trips, maintenance] = await Promise.all([
          getUserCountsApi().catch(() => null),
          vehicleApi.getAll().then(r => r.data).catch(() => []),
          api.get("/api/trips").then((r: any) => r.data.data || []).catch(() => []),
          maintenanceApi.getAll().then(r => r.data).catch(() => []),
        ]);
        setSnapshot({ counts, vehicles, trips, maintenance });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    const counts = snapshot.counts;
    const activeMaintenance = snapshot.maintenance.filter(
      (req) => req.status === "SUBMITTED" || req.status === "NEW" || req.status === "APPROVED"
    ).length;

    return [
      {
        title: "Total Users",
        value: counts?.total ?? 0,
        description: "Across all active and archived accounts",
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
          title="Driver Dashboard"
          description="Manage your driver profile, submit leave requests, view trip assignments, and manage security settings from one consistent workspace."
          icon={UserCircle}
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
                  <UserCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Driver Workspace
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">Everything in one place</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Your driver dashboard gives you centralized access to trip schedules, leave management, and your personal driver profile — all in one consistent workspace designed for clarity and speed.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Available Features
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "View and track your assigned trips and schedules",
                  "Manage your personal driver profile and certifications",
                  "Submit and review leave requests",
                  "Keep your security and login credentials updated",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-300" />
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Link
              href="/dashboards/driver/profile"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">My Profile</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Manage your profile, documents, and certifications.</p>
            </Link>
            <Link
              href="/dashboards/driver/leave-requests"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Leave Request</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Submit and track your leave applications.</p>
            </Link>
            <Link
              href="/dashboards/driver/trips"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">My Trips</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">View your assigned and completed trips.</p>
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
