"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, RefreshCw, Search } from "lucide-react";
import { getAllUsersApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import type { UserStatus, UserRole } from "@/lib/auth";
import { UserTable } from "@/components/admin/users/user-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

const STATUS_FILTER_OPTIONS: { label: string; value: UserStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Deactivated", value: "DEACTIVATED" },
  { label: "Unverified", value: "EMAIL_UNVERIFIED" },
];

export default function AllUsersPage() {
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [filtered, setFiltered] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsersApi();
      setAllUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filter whenever data, statusFilter, or search changes
  useEffect(() => {
    let result = allUsers;

    if (statusFilter !== "ALL") {
      result = result.filter((u) => u.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [allUsers, statusFilter, search]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                User Management
              </h1>
              <p className="text-sm text-slate-500">
                {allUsers.length} total users
              </p>
            </div>
          </div>

          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-slate-400
                       hover:text-slate-200 transition-colors disabled:opacity-40"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700
                         bg-slate-800/60 text-sm text-slate-100
                         placeholder:text-slate-500 focus:outline-none
                         focus:ring-2 focus:ring-amber-500/60 transition-colors"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold
                            border transition-colors
                            ${
                              statusFilter === opt.value
                                ? "bg-amber-500 text-slate-900 border-amber-500"
                                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:border-amber-700"
                            }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={28} className="text-amber-400" />
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <UserTable
              users={filtered}
              showReviewActions={false}
              onRefresh={fetchAll}
            />
          </div>
        )}
      </div>
    </div>
  );
}
