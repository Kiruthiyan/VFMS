"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  RefreshCw,
  Search,
  UserPlus,
  CheckCircle2,
  Clock,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllUsersApi, getUserCountsApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary, UserCounts } from "@/lib/api/admin";
import type { UserStatus, UserRole } from "@/lib/auth";
import { UserTable } from "@/components/admin/users/user-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import Link from "next/link";

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
    <AdminShell>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 bg-slate-950 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400">
                <Users className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  User Management
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Manage all system users, create accounts, and review registrations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAll}
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
              <button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold
                           text-slate-950 shadow-lg shadow-amber-500/20 transition-colors hover:bg-amber-300"
              >
                <UserPlus size={16} />
                Create User
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {counts && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {SUMMARY_CARDS.map((card) => {
              const Icon = card.icon;
              const count = counts[card.key as keyof UserCounts] ?? 0;
              return (
                <div
                  key={card.key}
                  className={`${card.color} rounded-2xl border border-slate-200 px-5 py-5
                              shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`h-9 w-9 ${card.iconBg} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                  </div>
                  <p
                    className={`text-3xl font-semibold ${card.textColor} tracking-tight`}
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
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or NIC..."
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5
                           bg-white text-sm text-[#101828]
                           placeholder:text-[#667085] focus:outline-none
                           focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                           transition-colors"
              />
            </div>

            {/* Role filter */}
            <div className="flex flex-wrap gap-2">
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRoleFilter(opt.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold
                              border transition-colors
                              ${
                                roleFilter === opt.value
                                  ? "bg-slate-950 text-white border-slate-950"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
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
                className={`rounded-xl px-4 py-2 text-xs font-semibold
                            border transition-colors
                            ${
                              statusFilter === opt.value
                                ? "bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-950/10"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                            }`}
              >
                {opt.label}
              </button>
            ))}

            {/* Link to deleted users */}
            <Link
              href="/admin/users/deleted"
              className="ml-auto flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold
                         border border-red-200 bg-red-50 text-red-600
                         hover:bg-red-100 transition-colors"
            >
              <Trash2 size={12} />
              View Deleted ({counts?.deleted ?? 0})
            </Link>
          </div>
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
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <UserTable
                users={paginatedUsers}
                showReviewActions={true}
                showDeletedActions={false}
                onRefresh={fetchAll}
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
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
                    className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50
                               transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-xl text-xs font-semibold
                                    border transition-colors
                                    ${
                                      page === currentPage
                                        ? "bg-slate-950 text-white border-slate-950"
                                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
                    className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50
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
    </AdminShell>
  );
}
