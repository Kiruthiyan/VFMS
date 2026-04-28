"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, RefreshCw, ArrowLeft } from "lucide-react";
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
          description={`${deletedUsers.length} deleted user${deletedUsers.length !== 1 ? "s" : ""} retained for audit and recovery.`}
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

        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Trash2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
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
