"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MaintenanceRequest, maintenanceApi, MaintenanceStatus } from "@/lib/api/maintenance";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Wrench, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function MaintenanceListPage() {
  const router = useRouter();
  const { canCreate } = useRole();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = (statusFilter !== "ALL")
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Maintenance Requests</h1>
            <p className="text-slate-500 mt-1">Track and manage vehicle maintenance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchRequests} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {canCreate && (
              <Button
                className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                onClick={() => router.push("/dashboard/maintenance/create")}
              >
                <Plus className="mr-2 h-4 w-4" /> New Request
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading && requests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading requests...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No maintenance requests found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-950 border-b border-blue-900">
                <tr>
                  <th className="px-6 py-4 font-semibold text-white">Vehicle</th>
                  <th className="px-6 py-4 font-semibold text-white">Type</th>
                  <th className="px-6 py-4 font-semibold text-white">Description</th>
                  <th className="px-6 py-4 font-semibold text-white">Status</th>
                  <th className="px-6 py-4 font-semibold text-white">Est. Cost</th>
                  <th className="px-6 py-4 font-semibold text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{req.vehicleBrandModel}</div>
                          <div className="text-slate-500 text-xs">{req.vehiclePlateNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                        {req.maintenanceType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{req.description}</td>
                    <td className="px-6 py-4">
                      <MaintenanceStatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {req.estimatedCost ? `Rs. ${req.estimatedCost.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => router.push(`/dashboard/maintenance/${req.id}`)}
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
