"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { getPendingUsersApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { UserTable } from "@/components/admin/users/user-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";

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
        <PageHeader
          title="Pending Registrations"
          description={`${users.length} user${users.length !== 1 ? "s" : ""} awaiting approval and account review.`}
          icon={Clock}
          actions={
            <Button variant="outline" onClick={fetchPending} disabled={loading}>
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </Button>
          }
        />

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
