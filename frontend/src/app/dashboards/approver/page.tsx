"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Droplets, FileCheck2, ShieldCheck, Users } from "lucide-react";
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

export default function ApproverDashboardPage() {
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Review Focus
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950">Workspace readiness</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    This approver area now follows the same dark-sidebar and light-workspace system as the rest of VFMS, so future review modules can land in a consistent structure.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Next capabilities
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Pending request queues with filters and review badges",
                  "Approval and rejection decision flows with evidence context",
                  "History panels for audit visibility and follow-up actions",
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
              href="/trips"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Trip Requests</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Review, assign, and approve trip requests.</p>
            </Link>
            <Link
              href="/drivers"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Drivers</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Manage and monitor driver profiles and certifications.</p>
            </Link>
            <Link
              href="/drivers/leave-requests"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Leave Requests</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Approve or reject leave applications.</p>
            </Link>
            <Link
              href="/drivers/infractions"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Infractions</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Log and review driver safety infractions.</p>
            </Link>
            <Link
              href="/dashboards/fleet/maintenance?status=SUBMITTED"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Maintenance Approvals</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Review pending vehicle maintenance requests.</p>
            </Link>
            <Link
              href="/dashboards/fleet/maintenance"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">All Maintenance</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">View complete maintenance request history.</p>
            </Link>
            <Link
              href="/dashboards/fleet/vehicles"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Vehicle Registry</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">View all registered vehicles and current status.</p>
            </Link>
            <Link
              href="/dashboards/fleet/rentals"
              className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
            >
              <p className="text-sm font-semibold text-slate-950">Vehicle Rentals</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Review rental vehicle activity and costs.</p>
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
