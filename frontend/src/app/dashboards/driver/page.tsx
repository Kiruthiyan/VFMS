"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  UserCircle,
  CheckCircle2,
  AlertTriangle,
  Droplets,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

interface DashboardTrip {
  id?: string;
  status?: string;
}

interface DashboardSnapshot {
  trips: DashboardTrip[];
}

const DEFAULT_SNAPSHOT: DashboardSnapshot = {
  trips: [],
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

export default function DriverDashboardPage() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(DEFAULT_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    async function loadDashboard() {
      try {
        if (!currentUser?.userId) {
          setSnapshot(DEFAULT_SNAPSHOT);
          return;
        }
        const trips = await api
          .get<unknown>(`/api/trips/driver/${currentUser.userId}`)
          .then((response) => readTripArray(response.data))
          .catch(() => []);
        setSnapshot({ trips });
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [currentUser?.userId]);

  const summaryCards = useMemo(() => {
    const needsAction = snapshot.trips.filter((trip) => trip.status === "APPROVED").length;
    const ongoing = snapshot.trips.filter((trip) => trip.status === "ONGOING").length;
    const completed = snapshot.trips.filter((trip) => trip.status === "COMPLETED").length;

    return [
      {
        title: "Assigned Trips",
        value: snapshot.trips.length,
        description: "Trips assigned to your driver profile",
        icon: UserCircle,
        iconAccent: "bg-blue-50 text-blue-600",
      },
      {
        title: "Pending Action",
        value: needsAction,
        description: "Approved trips waiting for your confirmation",
        icon: AlertTriangle,
        iconAccent: "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Ongoing",
        value: ongoing,
        description: "Trips currently in progress",
        icon: Droplets,
        iconAccent: "bg-sky-50 text-sky-600",
      },
      {
        title: "Completed",
        value: completed,
        description: "Finished trip assignments",
        icon: CheckCircle2,
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
