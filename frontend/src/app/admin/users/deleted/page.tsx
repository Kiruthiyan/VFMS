"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, RefreshCw, ArrowLeft, RotateCcw, ShieldAlert } from "lucide-react";
import { getDeletedUsersApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { UserTable } from "@/components/admin/users/user-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
          description={`${deletedUsers.length} archived user${deletedUsers.length !== 1 ? "s" : ""} retained for audit, recovery, and lifecycle tracking.`}
          icon={Trash2}
          iconClassName="text-red-600"
          actions={
            <>
              <Button variant="outline" onClick={fetchDeleted} disabled={loading}>
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/users">
                  <ArrowLeft size={16} />
                  User Dashboard
                </Link>
              </Button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Archived Accounts
            </p>
            <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              {deletedUsers.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Soft-deleted records preserved for governance and audit purposes.
            </p>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Restore Policy
            </p>
            <div className="mt-3 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <RotateCcw className="h-4 w-4" />
              </div>
              <p className="text-sm leading-6 text-slate-500">
                Restored users return to their previous lifecycle state, which helps preserve access history and operational traceability.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Deleted users are soft-deleted and preserved for audit purposes.
            You can restore any user back to their previous status by clicking
            the restore button.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <LoadingSpinner size={28} className="text-slate-950" />
            <p className="text-sm text-slate-500">Loading deleted users...</p>
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <UserTable
              users={deletedUsers}
              showReviewActions={false}
              showDeletedActions={true}
              onRefresh={fetchDeleted}
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
