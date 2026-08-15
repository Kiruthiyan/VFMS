"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Vehicle, vehicleApi } from "@/lib/api/vehicle";
import { tripAvailabilityApi } from "@/lib/api/trip-availability";
import { MaintenanceRequest, maintenanceApi } from "@/lib/api/maintenance";
import { VehicleStatusBadge } from "@/components/vehicles/VehicleStatusBadge";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Car,
  Calendar,
  Fuel,
  Building,
  Hash,
  Loader2,
  Wrench,
  Clock,
  DollarSign,
  AlertCircle,
  History,
  Palette,
  Users,
  ShieldCheck,
  FileCheck,
  Gauge,
  Pencil,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { canAdmin, canCreate } = useRole();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<
    MaintenanceRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [retiring, setRetiring] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const [isInTripUse, setIsInTripUse] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const [res, tripVehicleIds] = await Promise.all([
          vehicleApi.getById(Number(id)),
          tripAvailabilityApi.getActiveVehicleIds().catch((): number[] => []),
        ]);
        setVehicle(res.data);
        setIsInTripUse(
          res.data.status === "AVAILABLE" && tripVehicleIds.includes(res.data.id),
        );
      } catch {
        toast.error("Failed to load vehicle");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await maintenanceApi.getByVehicle(Number(id));
        setMaintenanceHistory(res.data);
      } catch {
        // silently fail — history is optional
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  const handleRetire = async () => {
    if (
      !confirm(
        `Are you sure you want to retire ${vehicle?.brand} ${vehicle?.model}? This cannot be undone.`,
      )
    )
      return;
    setRetiring(true);
    try {
      await vehicleApi.retire(Number(id));
      toast.success("Vehicle retired from fleet");
      router.push("/dashboards/fleet/vehicles");
    } catch {
      toast.error("Failed to retire vehicle");
    } finally {
      setRetiring(false);
    }
  };

  // ── Computed summary stats ──
  const closedRecords = maintenanceHistory.filter((r) => r.status === "CLOSED");
  const totalActualCost = closedRecords
    .filter((r) => r.actualCost != null)
    .reduce((sum, r) => sum + (r.actualCost ?? 0), 0);
  const totalDowntimeHours = closedRecords
    .filter((r) => r.downtimeHours != null)
    .reduce((sum, r) => sum + (r.downtimeHours ?? 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Vehicle not found.</p>
      </div>
    );
  }

  const vehicleDisplayStatus = isInTripUse ? "IN_TRIP_USE" : vehicle.status;

  return (
    <div className="vfms-detail-page">
      <div className="vfms-detail-container max-w-none animate-in fade-in duration-500">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vehicles
          </Button>
        </div>

        {/* ── Header Card ── */}
        <Card className="vfms-detail-card mb-6">
          <CardHeader className="vfms-form-header px-6 py-5 pl-8">
            <CardTitle className="flex flex-col gap-3 text-white text-lg sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-blue-950">
                <Car className="h-5 w-5" />
              </div>
              <span className="min-w-0 flex-1 truncate">
                {vehicle.brand} {vehicle.model}
              </span>
              <div className="sm:ml-auto">
                <VehicleStatusBadge status={vehicleDisplayStatus} />
              </div>
            </CardTitle>
          </CardHeader>

          {/* ── Tab Navigation ── */}
          <div className="flex border-b border-slate-200 bg-white">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "details"
                  ? "border-blue-950 text-blue-950"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Vehicle Details
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === "history"
                  ? "border-blue-950 text-blue-950"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <History className="h-4 w-4" />
              Maintenance History
              {maintenanceHistory.length > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-950 text-white text-xs">
                  {maintenanceHistory.length}
                </span>
              )}
            </button>
          </div>

          <CardContent className="pt-6">
            {/* ── Details Tab ── */}
            {activeTab === "details" && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="vfms-detail-tile">
                    <Hash className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="vfms-detail-label">Plate Number</p>
                      <p className="vfms-detail-value">
                        {vehicle.plateNumber}
                      </p>
                    </div>
                  </div>
                  <div className="vfms-detail-tile">
                    <Car className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="vfms-detail-label">Vehicle Type</p>
                      <p className="vfms-detail-value">
                        {vehicle.vehicleType}
                      </p>
                    </div>
                  </div>
                  <div className="vfms-detail-tile">
                    <Fuel className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="vfms-detail-label">Fuel Type</p>
                      <p className="vfms-detail-value">
                        {vehicle.fuelType}
                      </p>
                    </div>
                  </div>
                  <div className="vfms-detail-tile">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="vfms-detail-label">Year</p>
                      <p className="vfms-detail-value">
                        {vehicle.year}
                      </p>
                    </div>
                  </div>
                  <div className="vfms-detail-tile">
                    <Gauge className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="vfms-detail-label">Odometer</p>
                      <p className="vfms-detail-value">
                        {vehicle.odometerReading != null
                          ? `${vehicle.odometerReading.toLocaleString()} km`
                          : "Not recorded"}
                      </p>
                    </div>
                  </div>
                  <div className="vfms-detail-tile">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="vfms-detail-label">Department</p>
                      <p className="vfms-detail-value">
                        {vehicle.department || "Not assigned"}
                      </p>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(vehicle.color || vehicle.seatingCapacity) && (
                    <>
                      <div className="col-span-2 pt-1">
                        <p className="vfms-detail-section-label">
                          Additional Details
                        </p>
                      </div>
                      {vehicle.color && (
                        <div className="vfms-detail-tile">
                          <Palette className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="vfms-detail-label">Color</p>
                            <p className="vfms-detail-value">
                              {vehicle.color}
                            </p>
                          </div>
                        </div>
                      )}
                      {vehicle.seatingCapacity && (
                        <div className="vfms-detail-tile">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="vfms-detail-label">
                              Seating Capacity
                            </p>
                            <p className="vfms-detail-value">
                              {vehicle.seatingCapacity} seats
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Compliance Dates */}
                  {(vehicle.insuranceExpiryDate ||
                    vehicle.revenueLicenseExpiryDate) && (
                    <>
                      <div className="col-span-2 pt-1">
                        <p className="vfms-detail-section-label">
                          Compliance & Expiry Dates
                        </p>
                      </div>
                      {vehicle.insuranceExpiryDate &&
                        (() => {
                          const expiry = new Date(vehicle.insuranceExpiryDate);
                          const today = new Date();
                          const daysLeft = Math.ceil(
                            (expiry.getTime() - today.getTime()) /
                              (1000 * 60 * 60 * 24),
                          );
                          const isExpired = daysLeft < 0;
                          const isWarning = daysLeft >= 0 && daysLeft <= 30;
                          return (
                            <div
                              className={`flex items-center gap-3 p-4 rounded-lg ${isExpired ? "bg-red-50" : isWarning ? "bg-amber-50" : "bg-slate-50"}`}
                            >
                              <ShieldCheck
                                className={`h-5 w-5 ${isExpired ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-600"}`}
                              />
                              <div>
                                <p className="text-xs text-slate-500">
                                  Insurance Expiry
                                </p>
                                <p
                                  className={`font-semibold ${isExpired ? "text-red-700" : isWarning ? "text-amber-700" : "text-slate-900"}`}
                                >
                                  {expiry.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                                {isExpired && (
                                  <p className="text-xs text-red-500 font-medium">
                                    Expired {Math.abs(daysLeft)} days ago
                                  </p>
                                )}
                                {isWarning && (
                                  <p className="text-xs text-amber-500 font-medium">
                                    Expires in {daysLeft} days
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      {vehicle.revenueLicenseExpiryDate &&
                        (() => {
                          const expiry = new Date(
                            vehicle.revenueLicenseExpiryDate,
                          );
                          const today = new Date();
                          const daysLeft = Math.ceil(
                            (expiry.getTime() - today.getTime()) /
                              (1000 * 60 * 60 * 24),
                          );
                          const isExpired = daysLeft < 0;
                          const isWarning = daysLeft >= 0 && daysLeft <= 30;
                          return (
                            <div
                              className={`flex items-center gap-3 p-4 rounded-lg ${isExpired ? "bg-red-50" : isWarning ? "bg-amber-50" : "bg-slate-50"}`}
                            >
                              <FileCheck
                                className={`h-5 w-5 ${isExpired ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-600"}`}
                              />
                              <div>
                                <p className="text-xs text-slate-500">
                                  Revenue License Expiry
                                </p>
                                <p
                                  className={`font-semibold ${isExpired ? "text-red-700" : isWarning ? "text-amber-700" : "text-slate-900"}`}
                                >
                                  {expiry.toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                                {isExpired && (
                                  <p className="text-xs text-red-500 font-medium">
                                    Expired {Math.abs(daysLeft)} days ago
                                  </p>
                                )}
                                {isWarning && (
                                  <p className="text-xs text-amber-500 font-medium">
                                    Expires in {daysLeft} days
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200 flex-wrap">
                  {canAdmin && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/dashboards/fleet/vehicles/${vehicle.id}/edit`)
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Vehicle
                    </Button>
                  )}
                  {canAdmin && vehicle.status !== "RETIRED" && (
                    <Button
                      variant="destructive"
                      onClick={handleRetire}
                      disabled={retiring}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      {retiring ? "Retiring..." : "Retire Vehicle"}
                    </Button>
                  )}
                </div>
              </>
            )}

            {/* ── Maintenance History Tab ── */}
            {activeTab === "history" && (
              <div className="space-y-6">
                {/* Summary Stats */}
                {!historyLoading && maintenanceHistory.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-3">
                      <div className="h-9 w-9 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Requests</p>
                        <p className="font-bold text-slate-900 text-lg">
                          {maintenanceHistory.length}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-3">
                      <div className="h-9 w-9 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Cost</p>
                        <p className="font-bold text-slate-900 text-lg">
                          {totalActualCost > 0
                            ? `Rs. ${totalActualCost.toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg flex items-center gap-3">
                      <div className="h-9 w-9 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Downtime</p>
                        <p className="font-bold text-slate-900 text-lg">
                          {totalDowntimeHours > 0
                            ? totalDowntimeHours >= 24
                              ? `${Math.floor(totalDowntimeHours / 24)}d ${totalDowntimeHours % 24}h`
                              : `${totalDowntimeHours}h`
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* History Table */}
                {historyLoading ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading history...
                  </div>
                ) : maintenanceHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                    <AlertCircle className="h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium">
                      No maintenance records found for this vehicle.
                    </p>
                    {canCreate && vehicle.status !== "RETIRED" && (
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          router.push("/dashboards/fleet/maintenance/create")
                        }
                      >
                        <Wrench className="mr-2 h-4 w-4" /> Create First Request
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl shadow-md ring-1 ring-slate-200/50 border-0 overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0 text-left text-sm">
                      <thead className="bg-blue-950">
                        <tr>
                          <th className="rounded-tl-2xl px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Type
                          </th>
                          <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Description
                          </th>
                          <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Status
                          </th>
                          <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Cost
                          </th>
                          <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Downtime
                          </th>
                          <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Date
                          </th>
                          <th className="rounded-tr-2xl px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/90 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {maintenanceHistory
                          .slice()
                          .sort(
                            (a, b) =>
                              new Date(b.requestedDate).getTime() -
                              new Date(a.requestedDate).getTime(),
                          )
                          .map((rec) => (
                            <tr
                              key={rec.id}
                              className="group hover:bg-slate-50/80 transition-colors"
                            >
                              <td className="px-5 py-3">
                                <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                                  {rec.maintenanceType.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-600 max-w-[180px] truncate">
                                {rec.description}
                              </td>
                              <td className="px-5 py-3">
                                <MaintenanceStatusBadge status={rec.status} />
                              </td>
                              <td className="px-5 py-3 text-slate-700 text-xs">
                                {rec.actualCost != null ? (
                                  `Rs. ${Number(rec.actualCost).toLocaleString()}`
                                ) : rec.estimatedCost != null ? (
                                  <span className="text-slate-400">
                                    Est. Rs.{" "}
                                    {Number(rec.estimatedCost).toLocaleString()}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="px-5 py-3 text-slate-700 text-xs">
                                {rec.downtimeHours != null
                                  ? rec.downtimeHours === 0
                                    ? "< 1h"
                                    : rec.downtimeHours >= 24
                                      ? `${Math.floor(rec.downtimeHours / 24)}d ${rec.downtimeHours % 24}h`
                                      : `${rec.downtimeHours}h`
                                  : "—"}
                              </td>
                              <td className="px-5 py-3 text-slate-500 text-xs">
                                {new Date(rec.requestedDate).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-900 text-xs opacity-80 group-hover:opacity-100 transition-opacity"
                                  onClick={() =>
                                    router.push(
                                      `/dashboards/fleet/maintenance/${rec.id}`,
                                    )
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
