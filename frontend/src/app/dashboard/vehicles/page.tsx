"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Vehicle, vehicleApi, VehicleStatus } from "@/lib/api/vehicle";
import { VehicleStatusBadge } from "@/components/vehicles/VehicleStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Car, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function VehiclesPage() {
  const router = useRouter();
  const { canAdmin } = useRole();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = (statusFilter !== "ALL")
        ? await vehicleApi.filterByStatus(statusFilter as VehicleStatus)
        : await vehicleApi.getAll();
      setVehicles(res.data);
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.plateNumber.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vehicle Management</h1>
            <p className="text-slate-500 mt-1">Register and track fleet assets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchVehicles} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {canAdmin && (
              <Button
                className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                onClick={() => router.push("/dashboard/vehicles/add")}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by plate, brand, model..."
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
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading && vehicles.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading vehicles...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No vehicles found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-950 border-b border-blue-900">
                <tr>
                  <th className="px-6 py-4 font-semibold text-white">Vehicle Info</th>
                  <th className="px-6 py-4 font-semibold text-white">Type</th>
                  <th className="px-6 py-4 font-semibold text-white">Fuel</th>
                  <th className="px-6 py-4 font-semibold text-white">Status</th>
                  <th className="px-6 py-4 font-semibold text-white">Department</th>
                  <th className="px-6 py-4 font-semibold text-white text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{vehicle.brand} {vehicle.model}</div>
                          <div className="text-slate-500 text-xs">{vehicle.plateNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                        {vehicle.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{vehicle.fuelType}</td>
                    <td className="px-6 py-4">
                      <VehicleStatusBadge status={vehicle.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">{vehicle.department || "—"}</td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}`)}
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
