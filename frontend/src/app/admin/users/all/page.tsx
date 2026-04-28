"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

import type { UserRole, UserStatus } from "@/lib/auth";
import { CreateUserDialog } from "@/components/admin/users/create-user-dialog";
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
  type UserSummary,
} from "@/lib/api/admin";

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

export default function AllUsersPage() {
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [deletedCount, setDeletedCount] = useState(0);
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
      setDeletedCount(countsData.deleted ?? 0);
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
          user.nic?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allUsers, roleFilter, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedUsers = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const hasActiveFilters =
    statusFilter !== "ALL" || roleFilter !== "ALL" || search.trim().length > 0;
  const filteredSummary = useMemo(
    () => ({
      approved: filtered.filter((user) => user.status === "APPROVED").length,
      pending: filtered.filter((user) => user.status === "PENDING_APPROVAL")
        .length,
      adminCreated: filtered.filter((user) => user.createdByAdmin).length,
    }),
    [filtered]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roleFilter, search]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="All Users"
          description="Run search, triage approvals, and handle account actions from one streamlined directory built for faster admin work."
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
              <Button onClick={() => setShowCreateDialog(true)}>
                <UserPlus size={16} />
                Create User
              </Button>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Visible Users
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {filtered.length}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {hasActiveFilters
                  ? `Filtered from ${allUsers.length} total accounts`
                  : "Live directory across approved, pending, and deactivated users"}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Approved
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {filteredSummary.approved}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Active accounts currently ready to use the system
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Pending Review
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {filteredSummary.pending}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Accounts still waiting for approval decisions
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Admin Created
              </p>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                {filteredSummary.adminCreated}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Staff accounts created directly by administrators
                </p>
                <Link
                  href="/admin/users/deleted"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 size={12} />
                  Deleted {deletedCount}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

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
                the accounts that need attention now.
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
                placeholder="Search by name, email, or NIC..."
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
                  {STATUS_FILTER_OPTIONS.map((option) => (
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
                    Showing {filtered.length} matching account
                    {filtered.length === 1 ? "" : "s"} across the current
                    filters.
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

      {showCreateDialog && (
        <CreateUserDialog
          onClose={() => setShowCreateDialog(false)}
          onSuccess={fetchAll}
        />
      )}
    </AdminShell>
  );
}
