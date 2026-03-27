"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  RefreshCw,
  Search,
  UserPlus,
  CheckCircle2,
  Clock,
  XCircle,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllUsersApi, getUserCountsApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary, UserCounts } from "@/lib/api/admin";
import type { UserStatus, UserRole } from "@/lib/auth";
import { UserTable } from "@/components/admin/users/user-table";
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

const ITEMS_PER_PAGE = 15;

const STATUS_FILTER_OPTIONS: { label: string; value: UserStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Approved", value: "APPROVED" },
  { label: "Pending", value: "PENDING_APPROVAL" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Deactivated", value: "DEACTIVATED" },
];

const ROLE_FILTER_OPTIONS: { label: string; value: UserRole | "ALL" }[] = [
  { label: "All Roles", value: "ALL" },
  { label: "Admin", value: "ADMIN" },
  { label: "Approver", value: "APPROVER" },
  { label: "Staff", value: "SYSTEM_USER" },
  { label: "Driver", value: "DRIVER" },
];

const SUMMARY_CARDS = [
  {
    key: "total",
    label: "Total Users",
    icon: Users,
    color: "bg-[#0B1736]",
    textColor: "text-white",
    iconBg: "bg-[#F4B400]",
    iconColor: "text-[#0B1736]",
  },
  {
    key: "approved",
    label: "Approved",
    icon: CheckCircle2,
    color: "bg-white",
    textColor: "text-[#101828]",
    iconBg: "bg-[#ECFDF5]",
    iconColor: "text-[#12B76A]",
  },
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    color: "bg-white",
    textColor: "text-[#101828]",
    iconBg: "bg-[#FFFBEB]",
    iconColor: "text-[#F79009]",
  },
  {
    key: "deactivated",
    label: "Deactivated",
    icon: UserX,
    color: "bg-white",
    textColor: "text-[#101828]",
    iconBg: "bg-[#FEF2F2]",
    iconColor: "text-[#F04438]",
  },
  {
    key: "deleted",
    label: "Deleted",
    icon: Trash2,
    color: "bg-white",
    textColor: "text-[#101828]",
    iconBg: "bg-[#F5F7FB]",
    iconColor: "text-[#98A2B3]",
  },
];

export default function AllUsersPage() {
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [counts, setCounts] = useState<UserCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, countsData] = await Promise.all([
        getAllUsersApi(),
        getUserCountsApi(),
      ]);
      setAllUsers(usersData);
      setCounts(countsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filter + paginate
  const filtered = useMemo(() => {
    let result = allUsers;

    if (statusFilter !== "ALL") {
      result = result.filter((u) => u.status === statusFilter);
    }

    if (roleFilter !== "ALL") {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.nic?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allUsers, statusFilter, roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roleFilter, search]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
                <p className="text-sm text-white mt-1 opacity-90">
                  Manage all system users, create accounts, and review registrations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAll}
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
              <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold
                           bg-[#F4B400] text-[#0B1736] rounded-lg
                           hover:bg-[#FFC107] transition-colors
                           shadow-lg shadow-[0_0_20px_rgba(244,180,0,0.15)]"
              >
                <UserPlus size={16} />
                Create User
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {counts && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {SUMMARY_CARDS.map((card) => {
              const Icon = card.icon;
              const count = counts[card.key as keyof UserCounts] ?? 0;
              return (
                <div
                  key={card.key}
                  className={`${card.color} rounded-xl border border-[#E4E7EC] px-5 py-4
                              shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`h-9 w-9 ${card.iconBg} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                  </div>
                  <p
                    className={`text-2xl font-bold ${card.textColor} tracking-tight`}
                  >
                    {count}
                  </p>
                  <p
                    className={`text-xs font-medium mt-0.5 ${
                      card.key === "total" ? "text-white/70" : "text-[#667085]"
                    }`}
                  >
                    {card.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

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
                placeholder="Search by name, email, or NIC..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E4E7EC]
                           bg-white text-sm text-[#101828]
                           placeholder:text-[#667085] focus:outline-none
                           focus:ring-2 focus:ring-[#0B1736]/30 focus:border-[#0B1736]
                           transition-colors"
              />
            </div>

            {/* Role filter */}
            <div className="flex flex-wrap gap-2">
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRoleFilter(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold
                              border transition-colors
                              ${
                                roleFilter === opt.value
                                  ? "bg-[#0B1736] text-white border-[#0B1736]"
                                  : "bg-[#F9FAFC] text-[#475467] border-[#E4E7EC] hover:bg-[#F5F7FB] hover:border-[#0B1736]"
                              }`}
                >
                  {opt.label}
                </button>
              ))}
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

            {/* Link to deleted users */}
            <a
              href="/admin/users/deleted"
              className="px-4 py-2 rounded-lg text-xs font-semibold
                         border border-red-200 bg-red-50 text-red-600
                         hover:bg-red-100 transition-colors ml-auto flex items-center gap-1.5"
            >
              <Trash2 size={12} />
              View Deleted ({counts?.deleted ?? 0})
            </a>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <LoadingSpinner size={28} className="text-[#0B1736]" />
            <p className="text-sm text-[#667085]">Loading users...</p>
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-[#E4E7EC] overflow-hidden">
              <UserTable
                users={paginatedUsers}
                showReviewActions={true}
                showDeletedActions={false}
                onRefresh={fetchAll}
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-[#E4E7EC] px-6 py-3">
                <p className="text-xs text-[#667085]">
                  Showing{" "}
                  <span className="font-semibold text-[#101828]">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-[#101828]">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#101828]">
                    {filtered.length}
                  </span>{" "}
                  users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-[#E4E7EC] hover:bg-[#F5F7FB]
                               transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold
                                    border transition-colors
                                    ${
                                      page === currentPage
                                        ? "bg-[#0B1736] text-white border-[#0B1736]"
                                        : "border-[#E4E7EC] text-[#475467] hover:bg-[#F5F7FB]"
                                    }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(totalPages, prev + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-[#E4E7EC] hover:bg-[#F5F7FB]
                               transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Dialog */}
      {showCreateDialog && (
        <CreateUserDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={fetchAll}
        />
      )}
    </div>
  );
}
