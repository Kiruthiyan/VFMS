"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, RefreshCw, ArrowLeft } from "lucide-react";
import { getDeletedUsersApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { UserTable } from "@/components/admin/users/user-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

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
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E4E7EC] overflow-hidden">
          <div className="bg-red-600 px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Deleted Users History
                </h1>
                <p className="text-sm text-white mt-1 opacity-90">
                  {deletedUsers.length} deleted user
                  {deletedUsers.length !== 1 ? "s" : ""} in history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchDeleted}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                           bg-white/10 text-white rounded-lg border border-white/20
                           hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <a
                href="/admin/users"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold
                           bg-white text-red-600 rounded-lg
                           hover:bg-red-50 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Users
              </a>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
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
          <div className="bg-white rounded-xl shadow-sm border border-[#E4E7EC] overflow-hidden">
            <UserTable
              users={deletedUsers}
              showReviewActions={false}
              showDeletedActions={true}
              onRefresh={fetchDeleted}
            />
          </div>
        )}
      </div>
    </div>
  );
}
