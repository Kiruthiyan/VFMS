"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Car, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleStatusBadge } from "@/components/vehicles/VehicleStatusBadge";
import { Vehicle, vehicleApi, VehicleStatus } from "@/lib/api/vehicle";

export default function DriverVehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res =
        statusFilter !== "ALL"
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
    void fetchVehicles();
  }, [statusFilter]);

  const filtered = vehicles.filter((vehicle) => {
    const q = search.toLowerCase();
    return (
      vehicle.plateNumber.toLowerCase().includes(q) ||
      vehicle.brand.toLowerCase().includes(q) ||
      vehicle.model.toLowerCase().includes(q)
    );
  });

  const getComplianceWarning = (
    vehicle: Vehicle,
  ): { level: "expired" | "warning" | null; labels: string[] } => {
    const today = new Date();
    const labels: string[] = [];
    let level: "expired" | "warning" | null = null;

    const check = (dateStr: string | undefined, label: string) => {
      if (!dateStr) return;
      const expiry = new Date(dateStr);
      const daysLeft = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysLeft < 0) {
        labels.push(`${label} expired`);
        level = "expired";
      } else if (daysLeft <= 30) {
        labels.push(`${label} in ${daysLeft}d`);
        if (level !== "expired") level = "warning";
      }
    };

    check(vehicle.insuranceExpiryDate, "Insurance");
    check(vehicle.revenueLicenseExpiryDate, "Rev. License");
    return { level, labels };
  };

  return (
    <DashboardShell title="Vehicle Management" description="View and track fleet assets assigned across operations">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchVehicles}
            disabled={loading}
            aria-label="Refresh vehicles"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/80 p-2 shadow-sm backdrop-blur-md focus-within:ring-2 focus-within:ring-blue-950/10">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by plate, brand, model..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="border-none bg-transparent pl-9 text-slate-900 focus-visible:ring-0"
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

        <div className="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200/50">
          {loading && vehicles.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-8 text-center text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading vehicles...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No vehicles found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-blue-900 bg-blue-950">
                <tr>
                  {["Vehicle Info", "Type", "Fuel", "Status", "Department", "Actions"].map((header) => (
                    <th
                      key={header}
                      className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90 ${header === "Actions" ? "text-right" : ""}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((vehicle) => {
                  const { level, labels } = getComplianceWarning(vehicle);

                  return (
                    <tr key={vehicle.id} className="group transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-blue-950 shadow-sm ring-1 ring-black/5">
                            <Car className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-slate-900">
                              {vehicle.brand} {vehicle.model}
                              {level && (
                                <span
                                  title={labels.join(" | ")}
                                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${
                                    level === "expired"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-amber-100 text-amber-600"
                                  }`}
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  {level === "expired" ? "Expired" : "Expiring"}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{vehicle.plateNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {vehicle.vehicleType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{vehicle.fuelType}</td>
                      <td className="px-6 py-4">
                        <VehicleStatusBadge status={vehicle.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">{vehicle.department || "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 opacity-80 transition-opacity hover:text-blue-900 group-hover:opacity-100"
                          onClick={() => router.push(`/dashboards/driver/vehicles/${vehicle.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
