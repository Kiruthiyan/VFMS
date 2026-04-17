"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { rentalApi, RentalRecord, RentalStatus } from "@/lib/api/rental";
import { RentalStatusBadge } from "@/components/rental/RentalStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Car, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function RentalsPage() {
  const router = useRouter();
  const { canCreate } = useRole();
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = (statusFilter !== "ALL")
        ? await rentalApi.getByStatus(statusFilter as RentalStatus)
        : await rentalApi.getAll();
      setRentals(res.data);
    } catch {
      toast.error("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, [statusFilter]);

  const filtered = rentals.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.plateNumber.toLowerCase().includes(q) ||
      r.vendorName.toLowerCase().includes(q) ||
      r.vehicleType.toLowerCase().includes(q) ||
      (r.purpose && r.purpose.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">External Vehicle Rentals</h1>
            <p className="text-slate-500 mt-1">Rent vehicles from vendors to supplement the company fleet</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchRentals} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {canCreate && (
              <Button
                className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                onClick={() => router.push("/dashboard/rentals/create")}
              >
                <Plus className="mr-2 h-4 w-4" /> Rent a Vehicle
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by plate, vendor, type, purpose..."
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
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="RETURNED">Returned</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading && rentals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading rentals...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No rentals found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-950 border-b border-blue-900">
                <tr>
                  <th className="px-6 py-4 font-semibold text-white">Vehicle</th>
                  <th className="px-6 py-4 font-semibold text-white">Vendor</th>
                  <th className="px-6 py-4 font-semibold text-white">Period</th>
                  <th className="px-6 py-4 font-semibold text-white">Cost</th>
                  <th className="px-6 py-4 font-semibold text-white">Status</th>
                  <th className="px-6 py-4 font-semibold text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{r.plateNumber}</div>
                          <div className="text-slate-500 text-xs">{r.vehicleType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{r.vendorName}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{r.startDate}</div>
                      <div className="text-slate-400 text-xs">{r.endDate ? `to ${r.endDate}` : "Ongoing"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">Rs.{r.costPerDay.toLocaleString()}<span className="text-xs text-slate-400">/day (vendor rate)</span></div>
                      {r.totalCost && (
                        <div className="text-emerald-600 text-xs font-medium">Total: Rs.{r.totalCost.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <RentalStatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => router.push(`/dashboard/rentals/${r.id}`)}
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
