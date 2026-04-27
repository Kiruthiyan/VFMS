"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Droplets,
  RefreshCw,
  Users,
} from "lucide-react";

import { getErrorMessage, getPendingUsersApi, getUserCountsApi, type UserCounts, type UserSummary } from "@/lib/api/admin";
import { getAllFuelRecordsApi, type FuelRecord } from "@/lib/api/fuel";
import { AdminShell } from "@/components/layout/admin-shell";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface DashboardSnapshot {
  counts: UserCounts | null;
  pendingUsers: UserSummary[];
  fuelRecords: FuelRecord[];
}

const DEFAULT_SNAPSHOT: DashboardSnapshot = {
  counts: null,
  pendingUsers: [],
  fuelRecords: [],
};

function formatDateTime(dateValue: string): string {
  return new Date(dateValue).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboardPage() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(DEFAULT_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [counts, pendingUsers, fuelRecords] = await Promise.all([
        getUserCountsApi(),
        getPendingUsersApi(),
        getAllFuelRecordsApi(),
      ]);

      setSnapshot({
        counts,
        pendingUsers,
        fuelRecords,
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
    const flaggedRecords = snapshot.fuelRecords.filter(
      (record) => record.flaggedForMisuse
    ).length;

    return [
      {
        title: "Total Users",
        value: counts?.total ?? 0,
        subtitle: "Across all active and archived accounts",
        icon: Users,
        accent: "bg-slate-950 text-white",
        iconAccent: "bg-white/10 text-amber-300",
      },
      {
        title: "Active Users",
        value: counts?.approved ?? 0,
        subtitle: "Approved accounts ready to use the system",
        icon: CheckCircle2,
        accent: "bg-white text-slate-950",
        iconAccent: "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Pending Users",
        value: counts?.pending ?? 0,
        subtitle: "Registrations waiting for admin review",
        icon: Clock3,
        accent: "bg-white text-slate-950",
        iconAccent: "bg-amber-50 text-amber-600",
      },
      {
        title: "Fuel Entries",
        value: snapshot.fuelRecords.length,
        subtitle: "Recorded fuel transactions in the module",
        icon: Droplets,
        accent: "bg-white text-slate-950",
        iconAccent: "bg-sky-50 text-sky-600",
      },
      {
        title: "Flagged Records",
        value: flaggedRecords,
        subtitle: "Entries that need misuse review",
        icon: AlertTriangle,
        accent: "bg-white text-slate-950",
        iconAccent: "bg-rose-50 text-rose-600",
      },
    ];
  }, [snapshot.counts, snapshot.fuelRecords]);

  const recentFuelEntries = useMemo(
    () =>
      [...snapshot.fuelRecords]
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
        )
        .slice(0, 5),
    [snapshot.fuelRecords]
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300/90">
                Administrative Overview
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Manage users, fuel workflows, and operational visibility from one place.
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                This dashboard reuses the live User Management and Fuel Management modules already in the system and surfaces the most important admin signals first.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:opacity-60"
              >
                <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                Refresh data
              </button>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
              >
                Open user management
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

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
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {dashboardCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.title}
                    className={`${card.accent} rounded-[24px] border border-slate-200 p-5 shadow-sm transition-transform hover:-translate-y-0.5`}
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          {card.title}
                        </p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                          {card.value}
                        </p>
                      </div>
                      <div
                        className={`${card.iconAccent} flex h-11 w-11 items-center justify-center rounded-2xl`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-500">
                      {card.subtitle}
                    </p>
                  </article>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
              <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Pending approvals
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      New registrations that need an admin decision.
                    </p>
                  </div>
                  <Link
                    href="/admin/users/pending"
                    className="text-sm font-semibold text-slate-950 transition-colors hover:text-amber-600"
                  >
                    View all
                  </Link>
                </div>

                {snapshot.pendingUsers.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No pending registrations right now.
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      New signup requests will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {snapshot.pendingUsers.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col gap-3 rounded-3xl border border-slate-200 px-4 py-4 transition-colors hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-950">
                            {user.fullName}
                          </p>
                          <p className="truncate text-sm text-slate-500">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                            {user.role.replace("_", " ")}
                          </span>
                          <span className="text-slate-400">
                            {formatDateTime(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Recent fuel activity
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Latest entries from the fuel management module.
                    </p>
                  </div>
                  <Link
                    href="/admin/fuel/logs"
                    className="text-sm font-semibold text-slate-950 transition-colors hover:text-amber-600"
                  >
                    View logs
                  </Link>
                </div>

                {recentFuelEntries.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      Fuel records are not available yet.
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Create the first fuel entry to populate this panel.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentFuelEntries.map((record) => (
                      <div
                        key={record.id}
                        className="rounded-3xl border border-slate-200 px-4 py-4 transition-colors hover:border-slate-300"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-950">
                              {record.vehiclePlate}
                            </p>
                            <p className="text-sm text-slate-500">
                              {record.driverName ?? "No driver assigned"}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-semibold text-slate-950">
                              LKR {record.totalCost.toFixed(2)}
                            </p>
                            <p className="text-sm text-slate-500">
                              {record.quantity.toFixed(2)} L
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span>{formatShortDate(record.fuelDate)}</span>
                          {record.flaggedForMisuse && (
                            <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-600">
                              Flagged
                            </span>
                          )}
                          <Link
                            href={`/admin/fuel/${record.id}`}
                            className="font-semibold text-slate-700 transition-colors hover:text-amber-600"
                          >
                            Open record
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <Link
                href="/admin/users"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">
                  User Management
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create user accounts, review registrations, update roles, and manage account status.
                </p>
              </Link>
              <Link
                href="/admin/fuel"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">
                  Fuel Management
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Monitor entries, inspect logs, review flagged activity, and manage fuel records.
                </p>
              </Link>
              <Link
                href="/settings/change-password"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300"
              >
                <p className="text-sm font-semibold text-slate-950">
                  Security Settings
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Update admin credentials and keep your session access secure.
                </p>
              </Link>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}
