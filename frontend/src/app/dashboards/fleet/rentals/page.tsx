"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { rentalApi, RentalRecord, RentalStatus } from "@/lib/api/rental";
import {
  rentalTripVehicleId,
  tripAvailabilityApi,
} from "@/lib/api/trip-availability";
import { RentalStatusBadge } from "@/components/rental/RentalStatusBadge";
import { FleetSummaryCard } from "@/components/fleet/FleetSummaryCard";
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
  Clock3,
  CheckCircle2,
  CircleDollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function RentalsPage() {
  const router = useRouter();
  const { canCreate } = useRole();
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeTripVehicleIds, setActiveTripVehicleIds] = useState<Set<number>>(
    new Set(),
  );

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    try {
      const rentalsRequest =
        statusFilter !== "ALL"
          ? rentalApi.getByStatus(statusFilter as RentalStatus)
          : rentalApi.getAll();
      const [res, tripVehicleIds] = await Promise.all([
        rentalsRequest,
        tripAvailabilityApi.getActiveVehicleIds().catch((): number[] => []),
      ]);
      setRentals(res.data);
      setActiveTripVehicleIds(new Set(tripVehicleIds));
    } catch {
      toast.error("Failed to load rentals");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const filtered = rentals.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.plateNumber.toLowerCase().includes(q) ||
      r.vendorName.toLowerCase().includes(q) ||
      r.vehicleType.toLowerCase().includes(q) ||
      (r.purpose && r.purpose.toLowerCase().includes(q))
    );
  });

  const getRentalDisplayStatus = (rental: RentalRecord) =>
    rental.status === "ACTIVE" &&
    activeTripVehicleIds.has(rentalTripVehicleId(rental.id))
      ? "IN_TRIP_USE"
      : rental.status;

  const activeCount = rentals.filter((r) => r.status === "ACTIVE").length;
  const inTripUseCount = rentals.filter(
    (r) =>
      r.status === "ACTIVE" &&
      activeTripVehicleIds.has(rentalTripVehicleId(r.id)),
  ).length;
  const closedCount = rentals.filter(
    (r) => r.status === "RETURNED" || r.status === "CLOSED",
  ).length;
  const totalRentalCost = rentals.reduce((sum, r) => sum + (r.totalCost ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              External Vehicle Rentals
            </h1>
            <p className="text-slate-500 mt-1">
              Rent vehicles from vendors to supplement the company fleet
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="vfms-refresh-button"
              onClick={fetchRentals}
              disabled={loading}
              aria-label="Refresh rentals"
              title="Refresh rentals"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
            {canCreate && (
              <Button
                onClick={() => router.push("/dashboards/fleet/rentals/create")}
              >
                <Plus className="mr-2 h-4 w-4" /> Rent a Vehicle
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FleetSummaryCard
            label="Total Rentals"
            value={rentals.length}
            helper="External vehicle records"
            icon={Car}
          />
          <FleetSummaryCard
            label="Active"
            value={activeCount}
            helper="Currently available or assigned"
            icon={Clock3}
            tone={activeCount > 0 ? "blue" : "slate"}
          />
          <FleetSummaryCard
            label="In Trip Use"
            value={inTripUseCount}
            helper="Active rentals used by trips"
            icon={CheckCircle2}
            tone={inTripUseCount > 0 ? "emerald" : "slate"}
          />
          <FleetSummaryCard
            label="Total Cost"
            value={`Rs. ${totalRentalCost.toLocaleString()}`}
            helper={`${closedCount} returned or closed`}
            icon={CircleDollarSign}
            tone="amber"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-xl border border-slate-200/60 shadow-sm focus-within:ring-2 focus-within:ring-blue-950/10 transition-all">
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
        <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-hidden">
          <div className="vfms-card-header px-7 py-5 pl-8">
            <h2 className="text-xl font-bold text-slate-950">
              Rental Registry
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {filtered.length} external rental record
              {filtered.length === 1 ? "" : "s"} matching the current view
            </p>
          </div>
          {loading && rentals.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading rentals...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No rentals found.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-blue-950 border-b border-blue-900">
                <tr>
                  <th className="rounded-tl-2xl px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Period
                  </th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-white/90">
                    Cost
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
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="group hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950 shadow-sm ring-1 ring-black/5">
                          <Car className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {r.plateNumber}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {r.vehicleType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{r.vendorName}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{r.startDate}</div>
                      <div className="text-slate-400 text-xs">
                        {r.endDate ? `to ${r.endDate}` : "Ongoing"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">
                        Rs.{r.costPerDay.toLocaleString()}
                        <span className="text-xs text-slate-400">
                          /day (vendor rate)
                        </span>
                      </div>
                      {r.totalCost && (
                        <div className="text-emerald-600 text-xs font-medium">
                          Total: Rs.{r.totalCost.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <RentalStatusBadge status={getRentalDisplayStatus(r)} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-900 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          router.push(`/dashboards/fleet/rentals/${r.id}`)
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

