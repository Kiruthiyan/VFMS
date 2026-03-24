"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { getPendingUsersApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { UserTable } from "@/components/admin/users/user-table";
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
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E4E7EC] overflow-hidden">
          <div className="bg-[#0B1736] px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-[#F4B400] rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#0B1736]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Pending Registrations
                </h1>
                <p className="text-sm text-[#FFFFFF] mt-1 opacity-90">
                  {users.length} user{users.length !== 1 ? "s" : ""} awaiting approval
                </p>
              </div>
            </div>

            <button
              onClick={fetchPending}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                         bg-[#F4B400] text-[#0B1736] rounded-lg
                         hover:bg-[#FFC107] transition-colors disabled:opacity-50
                         shadow-lg shadow-[0_0_20px_rgba(244,180,0,0.15)]"
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
            <LoadingSpinner size={28} className="text-blue-950" />
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[#E4E7EC] overflow-hidden">
            <UserTable
              users={users}
              showReviewActions={true}
              onRefresh={fetchPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}
