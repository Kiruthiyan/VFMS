"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  Trash2,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import Link from "next/link";

import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";
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
    label: "Total Users",
    icon: Users,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    key: "deactivated",
    label: "Deactivated",
    icon: UserX,
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
  },
  {
    key: "deleted",
    label: "Deleted",
    icon: Trash2,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-500",
  },
];

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Use one organized workspace to review registrations, manage accounts, and monitor user access across VFMS."
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
              <Button onClick={() => setShowCreateDialog(true)}>
                <UserPlus size={16} />
                Create User
              </Button>
            </>
          }
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <LoadingSpinner size={28} className="text-slate-950" />
            <p className="text-sm text-slate-500">Loading user dashboard...</p>
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <>
            {counts && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {SUMMARY_CARDS.map((card) => {
                  const Icon = card.icon;
                  const count = counts[card.key as keyof UserCounts] ?? 0;
                  return (
                    <Card
                      key={card.key}
                      className="rounded-2xl border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <CardContent className="p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
                          >
                            <Icon className={`h-4 w-4 ${card.iconColor}`} />
                          </div>
                        </div>
                        <p className="text-3xl font-semibold tracking-tight text-slate-950">
                          {count}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {card.label}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-3">
              <Link href="/admin/users/all" className="group">
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Users className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-950">
                      All Users
                    </CardTitle>
                    <p className="mt-2 text-sm text-slate-500">
                      Open the full user directory with search, role filters,
                      status filters, and actions.
                    </p>
                    <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>{counts?.total ?? 0} total accounts</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/users/pending" className="group">
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Clock className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-950">
                      Pending Users
                    </CardTitle>
                    <p className="mt-2 text-sm text-slate-500">
                      Review registrations waiting for approval and complete
                      role assignment decisions.
                    </p>
                    <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>{counts?.pending ?? 0} awaiting review</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/admin/users/deleted" className="group">
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-semibold text-slate-950">
                      Deleted Users
                    </CardTitle>
                    <p className="mt-2 text-sm text-slate-500">
                      Access archived user records for audit, restore actions,
                      and lifecycle tracking.
                    </p>
                    <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>{counts?.deleted ?? 0} archived records</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.95fr)]">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <CardTitle className="text-base font-semibold text-slate-950">
                      Recent Registrations
                    </CardTitle>
                  </div>

                  {recentUsers.length === 0 ? (
                    <div className="px-6 py-10 text-sm text-slate-500">
                      No user records available yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {recentUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">
                              {user.fullName}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                            <p className="mt-2 text-xs text-slate-400">
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

              <Card>
                <CardContent className="p-6">
                  <CardTitle className="mb-6 text-base font-semibold text-slate-950">
                    Role Distribution
                  </CardTitle>
                  <div className="space-y-4">
                    {roleSummary.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {item.label}
                        </span>
                        <span className="text-xl font-semibold text-slate-950">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {showCreateDialog && (
        <CreateUserDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={fetchDashboard}
        />
      )}
    </AdminShell>
  );
}
