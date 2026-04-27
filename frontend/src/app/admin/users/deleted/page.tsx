"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, RefreshCw, ArrowLeft } from "lucide-react";
import { getDeletedUsersApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { UserTable } from "@/components/admin/users/user-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
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
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 bg-slate-950 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/15">
                <Trash2 className="h-6 w-6 text-red-300" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Deleted Users History
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  {deletedUsers.length} deleted user
                  {deletedUsers.length !== 1 ? "s" : ""} in history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDeleted}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold
                           text-white transition-colors hover:bg-white/15 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <Link
                href="/admin/users"
                className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold
                           text-slate-950 transition-colors hover:bg-slate-100"
              >
                <ArrowLeft size={16} />
                Back to Users
              </Link>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Trash2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Deleted users are soft-deleted and preserved for audit purposes.
            You can restore any user back to their previous status by clicking
            the restore button.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <LoadingSpinner size={28} className="text-red-600" />
            <p className="text-sm text-[#667085]">Loading deleted users...</p>
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
