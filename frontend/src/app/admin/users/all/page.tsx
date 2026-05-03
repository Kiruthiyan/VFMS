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

import { UserManagementNav } from "@/components/admin/users/user-management-nav";
import { UserTable } from "@/components/admin/users/user-table";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import type { UserRole, UserStatus } from "@/lib/auth";
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

function getFilterButtonClassName(isActive: boolean): string {
  return isActive
    ? "h-10 rounded-xl border border-amber-300 bg-amber-100 px-4 text-sm font-semibold text-slate-950 shadow-sm"
    : "h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-950";
}

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
      <div className="space-y-5">
        <PageHeader
          title="All Users"
          description="Search, filter, and manage every FleetPro account from one company-standard user directory."
          icon={Users}
          actions={
            <>
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
            </>
          }
        />

        <UserManagementNav />

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                <SlidersHorizontal className="h-4 w-4" />
                Directory Filters
              </div>

              <h2 className="mt-2 text-lg font-black tracking-tight text-slate-950">
                Search and refine user records
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Use role, status, and staff details to quickly find user
                accounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                <span className="font-bold text-slate-950">
                  {filtered.length}
                </span>{" "}
                account{filtered.length === 1 ? "" : "s"} shown
              </div>

              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                >
                  <X size={16} />
                  Clear
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(320px,1fr)_auto_auto] xl:items-start">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, NIC, or employee ID..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Role
              </p>

              <div className="flex max-w-sm flex-wrap gap-2">
                {ROLE_FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRoleFilter(option.value)}
                    className={getFilterButtonClassName(
                      roleFilter === option.value
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Status
              </p>

              <div className="flex max-w-sm flex-wrap gap-2">
                {statusFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={getFilterButtonClassName(
                      statusFilter === option.value
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white py-20 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size={28} className="text-slate-950" />
              <p className="text-sm font-medium text-slate-500">
                Loading users...
              </p>
            </div>
          </div>
        ) : error ? (
          <FormMessage type="error" message={error} />
        ) : (
          <>
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-950">
                    User Directory
                  </CardTitle>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Review user records, role assignments, and lifecycle status.
                    {counts?.pending
                      ? ` ${counts.pending} pending record${
                          counts.pending === 1 ? "" : "s"
                        } still require a decision.`
                      : " No pending review records remain in the current workflow."}
                  </p>
                </div>

                <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {filtered.length} Record{filtered.length !== 1 ? "s" : ""}
                </div>
              </div>

              <UserTable
                users={paginatedUsers}
                showReviewActions={true}
                showDeletedActions={false}
                onRefresh={fetchAll}
              />
            </section>

            {totalPages > 1 ? (
              <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((previous) => Math.max(1, previous - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-xl border border-slate-200 p-2 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-9 w-9 rounded-xl border text-xs font-semibold transition-colors ${
                          page === currentPage
                            ? "border-amber-300 bg-amber-100 text-slate-950"
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
                    aria-label="Next page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AdminShell>
  );
}