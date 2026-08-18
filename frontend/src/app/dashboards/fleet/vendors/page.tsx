"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { vendorApi } from "@/lib/api/rental";
import { FleetSummaryCard } from "@/components/fleet/FleetSummaryCard";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Building2,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  Archive,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/lib/query-keys";

export default function VendorsPage() {
  const router = useRouter();
  const { canAdmin } = useRole();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const {
    data: vendors = [],
    error,
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.vendors, canAdmin ? "all" : "active"],
    queryFn: async () => {
      const res = canAdmin
        ? await vendorApi.getAllIncludingInactive()
        : await vendorApi.getAll();
      return res.data;
    },
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load vendors");
    }
  }, [error]);

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(q) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
      (v.email && v.email.toLowerCase().includes(q));
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && v.active) ||
      (statusFilter === "INACTIVE" && !v.active);
    return matchesSearch && matchesStatus;
  });

  const activeCount = vendors.filter((v) => v.active).length;
  const inactiveCount = vendors.length - activeCount;
  const contactCount = vendors.filter(
    (v) => v.contactPerson || v.phone || v.email,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <PageHeader
          title="Rental Vendor Management"
          description="Manage vendors who supply vehicles to the company"
          icon={Building2}
          actions={
            <>
              <Button
                variant="outline"
                size="icon"
                className="vfms-refresh-button"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh vendors"
                title="Refresh vendors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
              {canAdmin && (
                <Button
                  onClick={() => router.push("/dashboards/fleet/vendors/add")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Vendor
                </Button>
              )}
            </>
          }
        />

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FleetSummaryCard
            label="Total Vendors"
            value={vendors.length}
            helper="Rental supplier records"
            icon={Building2}
          />
          <FleetSummaryCard
            label="Active"
            value={activeCount}
            helper="Available for rental creation"
            icon={CheckCircle2}
            tone="emerald"
          />
          <FleetSummaryCard
            label="Inactive"
            value={inactiveCount}
            helper="Hidden from staff selection"
            icon={Archive}
            tone={inactiveCount > 0 ? "red" : "slate"}
          />
          <FleetSummaryCard
            label="With Contacts"
            value={contactCount}
            helper="Usable vendor communication data"
            icon={UsersRound}
            tone="blue"
          />
        </div>

        {/* Search + Filter */}
        <div className="flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-xl border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-950/10 transition-all">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, contact person, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0 text-slate-900"
            />
          </div>
          <div className="hidden h-6 w-px bg-slate-200 sm:block" />
          {canAdmin && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full min-w-[9rem] bg-white text-slate-900 sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white text-slate-900">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-hidden">
          <div className="vfms-card-header px-7 py-5 pl-8">
            <h2 className="text-xl font-bold text-slate-950">
              Vendor Registry
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {filtered.length} rental vendor
              {filtered.length === 1 ? "" : "s"} matching the current view
            </p>
          </div>
          {loading && vendors.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading vendors...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No vendors found.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-blue-950 border-b border-blue-900">
                <tr>
                  <th className="rounded-tl-2xl px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Contact Person
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Email
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Status
                  </th>
                  <th className="rounded-tr-2xl px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className={`group hover:bg-slate-50/80 transition-colors ${!v.active ? "opacity-60" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950 shadow-sm ring-1 ring-black/5">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 truncate max-w-[220px]">
                            {v.name}
                          </div>
                          {v.address && (
                            <div className="text-slate-400 text-xs truncate max-w-[220px]">
                              {v.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {v.contactPerson || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {v.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {v.email || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                          v.active
                            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                            : "bg-red-100 text-red-700 ring-1 ring-red-300"
                        }`}
                      >
                        {v.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canAdmin ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900 opacity-80 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            router.push(`/dashboards/fleet/vendors/${v.id}`)
                          }
                        >
                          View
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">View only</span>
                      )}
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

