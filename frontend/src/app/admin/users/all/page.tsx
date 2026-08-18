"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/lib/auth";
import {
  getAllUsersApi,
  getErrorMessage,
  getUserCountsApi,
  isUserActive,
} from "@/lib/api/admin";
import { queryKeys } from "@/lib/query-keys";

const ITEMS_PER_PAGE = 15;

type SimpleStatusFilter = "ALL" | "ACTIVE" | "DEACTIVATED";

const STATUS_FILTER_OPTIONS: { label: string; value: SimpleStatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
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
  const [statusFilter, setStatusFilter] = useState<SimpleStatusFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data,
    error,
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.adminUsers, "all"],
    queryFn: async () => {
      const [usersData, countsData] = await Promise.all([
        getAllUsersApi(),
        getUserCountsApi(),
      ]);
      return { allUsers: usersData, counts: countsData };
    },
    placeholderData: (previous) => previous,
  });
  const allUsers = useMemo(() => data?.allUsers ?? [], [data?.allUsers]);
  const counts = data?.counts ?? null;
  const errorMessage = error ? getErrorMessage(error) : null;

  const filtered = useMemo(() => {
    let result = allUsers;

    if (statusFilter === "ACTIVE") {
      result = result.filter((user) => isUserActive(user));
    } else if (statusFilter === "DEACTIVATED") {
      result = result.filter(
        (user) => user.status === "DEACTIVATED" || (user.status === "APPROVED" && !user.enabled)
      );
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

  const hasActiveFilters =
    statusFilter !== "ALL" || roleFilter !== "ALL" || search.trim().length > 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, roleFilter, search]);

  return (

      <div className="space-y-5">
        <PageHeader
          title="All Users"
          description="Search, filter, and manage every FleetPro account from one company-standard user directory."
          icon={Users}
          actions={
            <>
              <Button
                variant="outline"
                size="icon"
                className="vfms-refresh-button"
                onClick={() => void refetch()}
                disabled={isFetching}
                aria-label="Refresh all users"
                title="Refresh all users"
              >
                <RefreshCw
                  size={16}
                  className={isFetching ? "animate-spin" : ""}
                />
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

        <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="vfms-card-header flex flex-col gap-3 px-6 py-4 pl-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-sm ring-1 ring-black/5">
                <SlidersHorizontal className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-950">
                  Directory Filters
                </h2>

                <p className="mt-0.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Search by identity, role, status, or staff details.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
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

          <div className="grid gap-4 border-t border-slate-200 p-5 xl:grid-cols-[minmax(360px,1fr)_220px_220px] xl:items-end">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, NIC, or employee ID..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Role
              </p>

              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as UserRole | "ALL")}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl bg-white text-slate-900 shadow-sm">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Status
              </p>

              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as SimpleStatusFilter)
                }
              >
                <SelectTrigger className="h-12 w-full rounded-2xl bg-white text-slate-900 shadow-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        ) : errorMessage ? (
          <FormMessage type="error" message={errorMessage} />
        ) : (
          <>
            <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
              <div className="vfms-card-header flex flex-col gap-3 px-6 py-5 pl-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl font-black tracking-tight text-slate-950">
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
                onRefresh={() => void refetch()}
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

  );
}
