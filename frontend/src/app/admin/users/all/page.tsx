"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

import type { UserRole, UserStatus } from "@/lib/auth";
import { UserTable } from "@/components/admin/users/user-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import {
  getAllUsersApi,
  getErrorMessage,
  getUserCountsApi,
  type UserCounts,
  type UserSummary,
} from "@/lib/api/admin";

const ITEMS_PER_PAGE = 15;

const BASE_STATUS_FILTER_OPTIONS: { label: string; value: UserStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Approved", value: "APPROVED" },
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

export default function AllUsersPage() {
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [counts, setCounts] = useState<UserCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const filtered = useMemo(() => {
    let result = allUsers;

    if (statusFilter !== "ALL") {
      result = result.filter((user) => user.status === statusFilter);
    }

    if (roleFilter !== "ALL") {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.nic?.toLowerCase().includes(query) ||
          user.employeeId?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allUsers, roleFilter, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const hasPendingUsers = useMemo(
    () => allUsers.some((user) => user.status === "PENDING_APPROVAL"),
    [allUsers]
  );
  const statusFilterOptions = useMemo(() => {
    if (!hasPendingUsers) {
      return BASE_STATUS_FILTER_OPTIONS;
    }

    return [
      BASE_STATUS_FILTER_OPTIONS[0],
      BASE_STATUS_FILTER_OPTIONS[1],
      { label: "Pending", value: "PENDING_APPROVAL" as const },
      ...BASE_STATUS_FILTER_OPTIONS.slice(2),
    ];
  }, [hasPendingUsers]);
  const hasActiveFilters =
    statusFilter !== "ALL" || roleFilter !== "ALL" || search.trim().length > 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roleFilter, search]);

  useEffect(() => {
    if (!hasPendingUsers && statusFilter === "PENDING_APPROVAL") {
      setStatusFilter("ALL");
    }
  }, [hasPendingUsers, statusFilter]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="All Users"
          description="Search, filter, and manage every VFMS account from one company-standard directory."
          icon={Users}
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/admin/users">Back to Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={fetchAll} disabled={loading}>
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/admin/users/create">
                  <UserPlus size={16} />
                  Create User
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/users/deleted">Deleted Users</Link>
              </Button>
            </>
          }
        />

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <SlidersHorizontal className="h-4 w-4" />
                Refine Directory
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                Find the right account faster
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Combine search, role, and status filters to focus the table on
                the accounts that need attention now, including search by
                employee ID.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">
                {filtered.length} account{filtered.length === 1 ? "" : "s"} shown
              </p>
              <p className="mt-1">
                {hasActiveFilters
                  ? `Filtered from ${allUsers.length} total user records.`
                  : "Showing the complete active user directory."}
              </p>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("ALL");
                  setStatusFilter("ALL");
                }}
              >
                <X size={16} />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="mt-5 space-y-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, NIC, or employee ID..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Filter By Role
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROLE_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRoleFilter(option.value)}
                      className={`rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                        roleFilter === option.value
                          ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Filter By Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusFilterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatusFilter(option.value)}
                      className={`rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                        statusFilter === option.value
                          ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <LoadingSpinner size={28} className="text-slate-950" />
            <p className="text-sm text-slate-500">Loading users...</p>
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <>
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-950">
                    User Directory
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Review user records, role assignments, and lifecycle status in one place.
                    {counts?.pending
                      ? ` ${counts.pending} legacy pending record${counts.pending === 1 ? "" : "s"} still require a decision.`
                      : " No pending review records remain in the current workflow."}
                  </p>
                </div>
                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
              <UserTable
                users={paginatedUsers}
                showReviewActions={true}
                showDeletedActions={false}
                onRefresh={fetchAll}
              />
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-900">
                    {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {filtered.length}
                  </span>{" "}
                  users
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((previous) => Math.max(1, previous - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-xl border border-slate-200 p-2 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-xl border text-xs font-semibold transition-colors ${
                          page === currentPage
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((previous) =>
                        Math.min(totalPages, previous + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-slate-200 p-2 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </AdminShell>
  );
}
