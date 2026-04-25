"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { vendorApi, Vendor } from "@/lib/api/rental";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Building2, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VendorsPage() {
  const router = useRouter();
  const { canCreate } = useRole();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getAllIncludingInactive();
      setVendors(res.data);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Rental Vendor Management
            </h1>
            <p className="text-slate-500 mt-1">
              Manage vendors who supply vehicles to the company
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchVendors}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            {canCreate && (
              <Button
                className="bg-blue-950 hover:bg-blue-900 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                onClick={() => router.push("/dashboard/vendors/add")}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Vendor
              </Button>
            )}
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-xl border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-950/10 transition-all">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, contact person, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0 text-slate-900"
            />
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-white text-slate-900">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white text-slate-900">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-hidden">
          {loading && vendors.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading vendors...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No vendors found.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-950 border-b border-blue-900">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
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
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90 text-right">
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
                        <div>
                          <div className="font-medium text-slate-900">
                            {v.name}
                          </div>
                          {v.address && (
                            <div className="text-slate-400 text-xs">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          router.push(`/dashboard/vendors/${v.id}`)
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
