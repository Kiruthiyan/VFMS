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
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E4E7EC] overflow-hidden">
          <div className="bg-[#0B1736] px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-[#F4B400] rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#0B1736]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  User Management
                </h1>
                <p className="text-sm text-[#FFFFFF] mt-1 opacity-90">
                  {allUsers.length} total users
                </p>
              </div>
            </div>

            <button
              onClick={fetchAll}
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

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E4E7EC] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E4E7EC]
                           bg-white text-sm text-[#101828]
                           placeholder:text-[#667085] focus:outline-none
                           focus:ring-2 focus:ring-[#0B1736]/30 focus:border-[#0B1736]
                           transition-colors"
              />
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold
                            border transition-colors
                            ${
                              statusFilter === opt.value
                                ? "bg-[#0B1736] text-white border-[#0B1736] shadow-lg shadow-[0_0_20px_rgba(11,23,54,0.15)]"
                                : "bg-[#F9FAFC] text-[#475467] border-[#E4E7EC] hover:bg-[#F5F7FB] hover:border-[#0B1736]"
                            }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size={28} className="text-[#0B1736]" />
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-[#E4E7EC] overflow-hidden">
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
