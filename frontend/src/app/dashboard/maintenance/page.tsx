"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MaintenanceRequest,
  maintenanceApi,
  MaintenanceStatus,
} from "@/lib/api/maintenance";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Wrench, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

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
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") ?? "ALL",
  );

  // Sync filter if URL param changes (e.g. sidebar nav)
  useEffect(() => {
    const param = searchParams.get("status") ?? "ALL";
    setStatusFilter(param);
  }, [searchParams]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res =
        statusFilter !== "ALL"
          ? await maintenanceApi.getByStatus(statusFilter as MaintenanceStatus)
          : await maintenanceApi.getAll();
      setRequests(res.data);
    } catch {
      toast.error("Failed to load maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.vehiclePlateNumber.toLowerCase().includes(q) ||
      r.vehicleBrandModel.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  });

  const pageTitle =
    statusFilter === "SUBMITTED" ? "Pending Approvals" : "Maintenance Requests";
  const pageSubtitle =
    statusFilter === "SUBMITTED"
      ? "Review and action submitted requests"
      : "Track and manage vehicle maintenance";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-slate-500 mt-1">{pageSubtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchRequests}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            {canCreate && (
              <Button
                className="bg-blue-950 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                onClick={() => router.push("/dashboard/maintenance/create")}
              >
                <Plus className="mr-2 h-4 w-4" /> New Request
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-xl border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-950/10 transition-all">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by vehicle, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0 text-slate-900"
            />
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-white text-slate-900">
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-hidden">
          {loading && requests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading requests...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No maintenance requests found.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-950 border-b border-blue-900">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
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
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90 text-right">
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
                          router.push(`/dashboard/maintenance/${req.id}`)
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
