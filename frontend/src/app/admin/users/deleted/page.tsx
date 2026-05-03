"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from "lucide-react";

import { UserManagementNav } from "@/components/admin/users/user-management-nav";
import { UserTable } from "@/components/admin/users/user-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import {
  getDeletedUsersApi,
  getErrorMessage,
  type UserSummary,
} from "@/lib/api/admin";

export default function DeletedUsersPage() {
  const [deletedUsers, setDeletedUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDeletedUsersApi();
      setDeletedUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeleted();
  }, [fetchDeleted]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="Deleted Users"
          description={`${deletedUsers.length} archived user${
            deletedUsers.length !== 1 ? "s" : ""
          } retained for audit, recovery, and lifecycle tracking.`}
          icon={Trash2}
          actions={
            <Button variant="outline" onClick={fetchDeleted} disabled={loading}>
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </Button>
          }
        />

        <UserManagementNav />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card className="rounded-[30px] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Archived Accounts
                  </p>

                  <p className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                    {deletedUsers.length}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Soft-deleted user records preserved for governance, audit
                    review, and controlled account restoration.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Archive className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <RotateCcw className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle className="text-base font-bold text-slate-950">
                    Restore Policy
                  </CardTitle>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Restored users return to their previous lifecycle state,
                    helping FleetPro preserve access history and operational
                    traceability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950">
                Archive Guidance
              </p>

              <p className="mt-1 max-w-4xl text-sm leading-6 text-amber-900">
                Deleted users are retained through soft delete. Restore an
                account only when access needs to be reactivated with full
                lifecycle continuity and audit history.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white py-20 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size={28} className="text-slate-950" />
              <p className="text-sm font-medium text-slate-500">
                Loading deleted users...
              </p>
            </div>
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-950">
                  Archived User Records
                </CardTitle>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Review archived accounts and restore users when access needs
                  to be reactivated.
                </p>
              </div>

              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                {deletedUsers.length} Record
                {deletedUsers.length !== 1 ? "s" : ""}
              </div>
            </div>

            <UserTable
              users={deletedUsers}
              showReviewActions={false}
              showDeletedActions={true}
              onRefresh={fetchDeleted}
            />
          </section>
        )}
      </div>
    </AdminShell>
  );
}