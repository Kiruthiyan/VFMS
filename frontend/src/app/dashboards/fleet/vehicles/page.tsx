"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Vehicle, vehicleApi, VehicleStatus } from "@/lib/api/vehicle";
import { tripAvailabilityApi } from "@/lib/api/trip-availability";
import { VehicleStatusBadge } from "@/components/vehicles/VehicleStatusBadge";
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
  Car,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";
import { queryKeys } from "@/lib/query-keys";

export default function VehiclesPage() {
  const router = useRouter();
  const { canAdmin } = useRole();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.vehicles(statusFilter),
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const vehiclesRequest =
        statusFilter !== "ALL"
          ? vehicleApi.filterByStatus(statusFilter as VehicleStatus)
          : vehicleApi.getAll();
      const [res, tripVehicleIds] = await Promise.all([
        vehiclesRequest,
        tripAvailabilityApi.getActiveVehicleIds().catch((): number[] => []),
      ]);
      return {
        vehicles: res.data,
        activeTripVehicleIds: new Set(tripVehicleIds),
      };
    },
  });

  const vehicles = data?.vehicles ?? [];
  const activeTripVehicleIds = data?.activeTripVehicleIds ?? new Set<number>();
  const loading = isLoading;

  useEffect(() => {
    if (error) {
      toast.error("Failed to load vehicles");
    }
  }, [error]);

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase();
    return (
      v.plateNumber.toLowerCase().includes(q) ||
      v.brand.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q)
    );
  });

  const getVehicleDisplayStatus = (vehicle: Vehicle) =>
    vehicle.status === "AVAILABLE" && activeTripVehicleIds.has(vehicle.id)
      ? "IN_TRIP_USE"
      : vehicle.status;

  const availableCount = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const inTripUseCount = vehicles.filter(
    (v) => v.status === "AVAILABLE" && activeTripVehicleIds.has(v.id),
  ).length;
  const maintenanceCount = vehicles.filter(
    (v) => v.status === "UNDER_MAINTENANCE",
  ).length;

  // ── Compliance warning helper ──
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
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <PageHeader
          title="Vehicle Management"
          description="Register and track fleet assets"
          icon={Car}
          actions={
            <>
              <Button
                variant="outline"
                size="icon"
                className="vfms-refresh-button"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh vehicles"
                title="Refresh vehicles"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
              {canAdmin && (
                <Button
                  onClick={() => router.push("/dashboards/fleet/vehicles/add")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
              )}
            </>
          }
        />

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FleetSummaryCard
            label="Total Vehicles"
            value={vehicles.length}
            helper="Company-owned fleet assets"
            icon={Car}
          />
          <FleetSummaryCard
            label="Available"
            value={availableCount}
            helper="Ready for assignment"
            icon={CheckCircle2}
            tone="emerald"
          />
          <FleetSummaryCard
            label="In Trip Use"
            value={inTripUseCount}
            helper="Currently tied to active trips"
            icon={Clock3}
            tone="blue"
          />
          <FleetSummaryCard
            label="Under Maintenance"
            value={maintenanceCount}
            helper="Temporarily unavailable"
            icon={Wrench}
            tone={maintenanceCount > 0 ? "amber" : "slate"}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-xl border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-950/10 transition-all">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by plate, brand, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-none bg-transparent focus-visible:ring-0 text-slate-900"
            />
          </div>
          <div className="hidden h-6 w-px bg-slate-200 sm:block" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full min-w-[9rem] bg-white text-slate-900 sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white text-slate-900">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="UNDER_MAINTENANCE">
                Under Maintenance
              </SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-hidden">
          <div className="vfms-card-header px-7 py-5 pl-8">
            <h2 className="text-xl font-bold text-slate-950">
              Vehicle Registry
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {filtered.length} company-owned fleet asset
              {filtered.length === 1 ? "" : "s"} matching the current view
            </p>
          </div>
          {loading && vehicles.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading vehicles...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No vehicles found.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-blue-950 border-b border-blue-900">
                <tr>
                  <th className="rounded-tl-2xl px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Vehicle Info
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Type
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Fuel
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Department
                  </th>
                  <th className="rounded-tr-2xl px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="group hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950 shadow-sm ring-1 ring-black/5">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 flex items-center gap-1.5">
                            {vehicle.brand} {vehicle.model}
                            {(() => {
                              const { level, labels } =
                                getComplianceWarning(vehicle);
                              if (!level) return null;
                              return (
                                <span
                                  title={labels.join(" · ")}
                                  className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${
                                    level === "expired"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-amber-100 text-amber-600"
                                  }`}
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  {level === "expired" ? "Expired" : "Expiring"}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {vehicle.plateNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                        {vehicle.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vehicle.fuelType}
                    </td>
                    <td className="px-6 py-4">
                      <VehicleStatusBadge
                        status={getVehicleDisplayStatus(vehicle)}
                      />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {vehicle.department || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          router.push(`/dashboards/fleet/vehicles/${vehicle.id}`)
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

