"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { getPendingUsersApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { UserTable } from "@/components/admin/users/user-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

export default function PendingUsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingUsersApi();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 bg-slate-950 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400">
                <Clock className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  Pending Registrations
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  {users.length} user{users.length !== 1 ? "s" : ""} awaiting approval
                </p>
              </div>
            </div>

            <button
              onClick={fetchPending}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold
                         text-slate-950 transition-colors hover:bg-amber-300 disabled:opacity-50
                         shadow-lg shadow-amber-500/20"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={28} className="text-slate-950" />
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <UserTable
              users={users}
              showReviewActions={true}
              onRefresh={fetchPending}
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
