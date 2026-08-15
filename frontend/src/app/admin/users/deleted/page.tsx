"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { UserManagementNav } from "@/components/admin/users/user-management-nav";
import { UserTable } from "@/components/admin/users/user-table";

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
    <div className="space-y-6">
      <PageHeader
        title="Deleted Users"
        description={`${deletedUsers.length} archived user${
          deletedUsers.length !== 1 ? "s" : ""
        } retained for audit, recovery, and lifecycle tracking.`}
        icon={Trash2}
        actions={
          <Button
            variant="outline"
            size="icon"
            className="vfms-refresh-button"
            onClick={fetchDeleted}
            disabled={loading}
            aria-label="Refresh deleted users"
            title="Refresh deleted users"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        }
      />

      <UserManagementNav />

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-36 items-start justify-between gap-5 p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Archived Accounts
              </p>
              <p className="mt-5 text-4xl font-black tracking-tight text-slate-950">
                {deletedUsers.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Soft-deleted records retained for controlled recovery.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200">
              <Archive className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-36 items-start justify-between gap-5 p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Restore Ready
              </p>
              <p className="mt-5 text-4xl font-black tracking-tight text-slate-950">
                {deletedUsers.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Accounts can be restored when access is approved again.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
              <RotateCcw className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-36 items-start justify-between gap-5 p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Audit Policy
              </p>
              <CardTitle className="mt-5 text-xl font-black text-slate-950">
                Soft delete
              </CardTitle>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Lifecycle history is preserved for traceability and review.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div className="vfms-card-header flex flex-col gap-3 px-6 py-5 pl-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-black text-slate-950">
              Archived User Records
            </CardTitle>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Review archived accounts and restore users when company access
              needs to be reactivated.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
            {deletedUsers.length} Record
            {deletedUsers.length !== 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16">
            <LoadingSpinner size={28} className="text-slate-950" />
            <p className="text-sm font-medium text-slate-500">
              Loading deleted users...
            </p>
          </div>
        ) : error ? (
          <div className="p-6">
            <FormMessage type="error" message={error} />
          </div>
        ) : (
          <UserTable
            users={deletedUsers}
            showReviewActions={false}
            showDeletedActions={true}
            onRefresh={fetchDeleted}
          />
        )}
      </section>
    </div>
  );
}
