"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Truck,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";

import { UserManagementNav } from "@/components/admin/users/user-management-nav";
import { UserRoleBadge } from "@/components/admin/users/user-role-badge";
import { UserStatusBadge } from "@/components/admin/users/user-status-badge";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import {
  getAllUsersApi,
  getErrorMessage,
  getUserCountsApi,
  type UserCounts,
  type UserSummary,
} from "@/lib/api/admin";

const SUMMARY_CARDS = [
  {
    key: "total",
    label: "Total Accounts",
    description: "All registered platform accounts",
    icon: Users,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    key: "staff",
    label: "Staff",
    description: "Verified company system users",
    icon: CheckCircle2,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
  },
  {
    key: "drivers",
    label: "Drivers",
    description: "Admin-created driver accounts",
    icon: Truck,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
  },
  {
    key: "deleted",
    label: "Archived",
    description: "Soft-deleted user records",
    icon: Trash2,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
] as const;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UserManagementDashboardPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [counts, setCounts] = useState<UserCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [usersData, countsData] = await Promise.all([
        getAllUsersApi(),
        getUserCountsApi(),
      ]);

      setUsers(usersData);
      setCounts(countsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [users]
  );

  const roleSummary = useMemo(() => {
    const summary = {
      ADMIN: 0,
      APPROVER: 0,
      SYSTEM_USER: 0,
      DRIVER: 0,
    };

    users.forEach((user) => {
      summary[user.role] += 1;
    });

    return [
      { label: "Administrators", value: summary.ADMIN },
      { label: "Approvers", value: summary.APPROVER },
      { label: "Staff", value: summary.SYSTEM_USER },
      { label: "Drivers", value: summary.DRIVER },
    ];
  }, [users]);

  const summaryValues = useMemo(
    () => ({
      total: counts?.total ?? users.length,
      staff: users.filter((user) => user.role === "SYSTEM_USER").length,
      drivers: users.filter((user) => user.role === "DRIVER").length,
      deleted: counts?.deleted ?? 0,
    }),
    [counts, users]
  );

  const lifecycleSummary = useMemo(
    () => [
      { label: "Approved", value: counts?.approved ?? 0 },
      { label: "Pending", value: counts?.pending ?? 0 },
      { label: "Rejected", value: counts?.rejected ?? 0 },
      { label: "Deactivated", value: counts?.deactivated ?? 0 },
    ],
    [counts]
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Manage user accounts, access control, roles, and lifecycle decisions from one professional FleetPro workspace."
          icon={Users}
          actions={
            <>
              <Button
                variant="outline"
                onClick={fetchDashboard}
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </Button>

              <Button asChild>
                <Link href="/admin/users/create">
                  <UserPlus size={16} />
                  Create User
                </Link>
              </Button>
            </>
          }
        />

        <UserManagementNav />

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white py-20 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size={28} className="text-slate-950" />
              <p className="text-sm font-medium text-slate-500">
                Loading user dashboard...
              </p>
            </div>
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <>
            <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Account Overview
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
                    FleetPro user access summary
                  </h2>
                </div>

                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  Monitor registered accounts, staff access, driver profiles,
                  and archived records in one place.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {SUMMARY_CARDS.map((card) => {
                  const Icon = card.icon;
                  const count =
                    summaryValues[card.key as keyof typeof summaryValues] ?? 0;

                  return (
                    <Card
                      key={card.key}
                      className="rounded-[24px] border-slate-200 bg-slate-50 shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}
                          >
                            <Icon className={`h-5 w-5 ${card.iconColor}`} />
                          </div>

                          <p className="text-3xl font-black tracking-tight text-slate-950">
                            {count}
                          </p>
                        </div>

                        <div className="mt-5">
                          <p className="text-sm font-bold text-slate-950">
                            {card.label}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {card.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                  <ShieldAlert className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">
                    Onboarding Standard
                  </p>
                  <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-700">
                    Staff self-registration is matched with verified company
                    records and email verification. Driver, approver, and
                    administrator accounts remain controlled by the admin team.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
              <Card className="overflow-hidden rounded-[30px] border-slate-200 bg-white shadow-sm">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-slate-950">
                        Recent Accounts
                      </CardTitle>
                      <p className="mt-1 text-sm text-slate-500">
                        Latest user accounts created in FleetPro.
                      </p>
                    </div>

                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin/users/all">View All</Link>
                    </Button>
                  </div>

                  {recentUsers.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                        <Users className="h-5 w-5" />
                      </div>
                      <p className="mt-4 text-sm font-medium text-slate-600">
                        No user records available yet.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {recentUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex flex-col gap-4 px-6 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-950">
                              {user.fullName}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {user.email}
                            </p>

                            <p className="mt-2 text-xs font-medium text-slate-400">
                              Registered {formatDate(user.createdAt)}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <UserRoleBadge role={user.role} />
                            <UserStatusBadge status={user.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-[30px] border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <CardTitle className="text-base font-bold text-slate-950">
                      Access Overview
                    </CardTitle>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Role distribution and account lifecycle status.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {roleSummary.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <span className="text-sm font-semibold text-slate-700">
                          {item.label}
                        </span>

                        <span className="text-xl font-black text-slate-950">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Lifecycle Status
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {lifecycleSummary.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {item.label}
                          </p>

                          <p className="mt-2 text-2xl font-black text-slate-950">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-white">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-300">
                        <ShieldCheck className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Access Governance
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          Review role distribution regularly and keep
                          high-privilege access limited to approved users.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}