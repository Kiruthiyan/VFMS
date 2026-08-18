"use client";

import { useState, useEffect, Suspense } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { maintenanceApi, MaintenanceStatus } from "@/lib/api/maintenance";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import { FleetSummaryCard } from "@/components/fleet/FleetSummaryCard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Wrench,
  Loader2,
  RefreshCw,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";
import { queryKeys } from "@/lib/query-keys";

export default function MaintenanceListPage() {
  return (
    <Suspense fallback={null}>
      <MaintenanceList />
    </Suspense>
  );
}

function MaintenanceList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canCreate } = useRole();
  const statusParam = searchParams.get("status");
  const isPendingApprovalsView = statusParam === "SUBMITTED";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(
    statusParam ?? "ALL",
  );

  // Sync filter if URL param changes (e.g. sidebar nav)
  useEffect(() => {
    const param = isPendingApprovalsView ? "SUBMITTED" : statusParam ?? "ALL";
    setStatusFilter(param);
  }, [isPendingApprovalsView, statusParam]);

  const {
    data: requests = [],
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.maintenance(statusFilter),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res =
        statusFilter !== "ALL"
          ? await maintenanceApi.getByStatus(statusFilter as MaintenanceStatus)
          : await maintenanceApi.getAll();
      return res.data;
    },
  });

  const loading = isLoading;

  useEffect(() => {
    if (error) {
      toast.error("Failed to load maintenance requests");
    }
  }, [error]);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.vehiclePlateNumber.toLowerCase().includes(q) ||
      r.vehicleBrandModel.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  const submittedCount = requests.filter((r) => r.status === "SUBMITTED").length;
  const openCount = requests.filter((r) =>
    ["NEW", "SUBMITTED", "APPROVED", "REJECTED"].includes(r.status),
  ).length;
  const closedCount = requests.filter((r) => r.status === "CLOSED").length;

  const pageTitle =
    isPendingApprovalsView ? "Pending Approvals" : "Maintenance Requests";
  const pageSubtitle =
    isPendingApprovalsView
      ? "Review and action submitted requests"
      : "Track and manage vehicle maintenance";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <PageHeader
          title={pageTitle}
          description={pageSubtitle}
          icon={Wrench}
          actions={
            <>
              <Button
                variant="outline"
                size="icon"
                className="vfms-refresh-button"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh maintenance requests"
                title="Refresh maintenance requests"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
              {canCreate && (
                <Button
                  onClick={() => router.push("/dashboards/fleet/maintenance/create")}
                >
                  <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
              )}
            </>
          }
        />

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FleetSummaryCard
            label="Total Requests"
            value={requests.length}
            helper="Maintenance records tracked"
            icon={Wrench}
          />
          <FleetSummaryCard
            label="Pending Approval"
            value={submittedCount}
            helper="Waiting for approver action"
            icon={ClipboardCheck}
            tone={submittedCount > 0 ? "blue" : "slate"}
          />
          <FleetSummaryCard
            label="Open Work"
            value={openCount}
            helper="Not yet closed"
            icon={Clock3}
            tone={openCount > 0 ? "amber" : "slate"}
          />
          <FleetSummaryCard
            label="Closed"
            value={closedCount}
            helper="Completed maintenance cases"
            icon={CheckCircle2}
            tone="emerald"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-xl border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-950/10 transition-all">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by vehicle, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0 text-slate-900"
            />
          </div>
          {!isPendingApprovalsView && (
            <>
              <div className="hidden h-6 w-px bg-slate-200 sm:block" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full min-w-[9rem] bg-white text-slate-900 sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white text-slate-900">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-hidden">
          <div className="vfms-card-header px-7 py-5 pl-8">
            <h2 className="text-xl font-bold text-slate-950">
              {isPendingApprovalsView
                ? "Pending Approval Registry"
                : "Maintenance Registry"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {filtered.length} maintenance request
              {filtered.length === 1 ? "" : "s"} matching the current view
            </p>
          </div>
          {loading && requests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading requests...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No maintenance requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-blue-950 border-b border-blue-900">
                <tr>
                  <th className="rounded-tl-2xl px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Type
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Description
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Est. Cost
                  </th>
                  <th className="rounded-tr-2xl px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="group hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950 shadow-sm ring-1 ring-black/5">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {req.vehicleBrandModel}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {req.vehiclePlateNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                        {req.maintenanceType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">
                      {req.description}
                    </td>
                    <td className="px-6 py-4">
                      <MaintenanceStatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {req.estimatedCost
                        ? `Rs. ${req.estimatedCost.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          router.push(`/dashboards/fleet/maintenance/${req.id}`)
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

