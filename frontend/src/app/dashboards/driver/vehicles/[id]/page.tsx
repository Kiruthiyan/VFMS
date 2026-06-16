"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Calendar,
  Car,
  Clock,
  DollarSign,
  FileCheck,
  Fuel,
  Hash,
  History,
  Loader2,
  Palette,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MaintenanceStatusBadge } from "@/components/maintenance/MaintenanceStatusBadge";
import { VehicleStatusBadge } from "@/components/vehicles/VehicleStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceRequest, maintenanceApi } from "@/lib/api/maintenance";
import { Vehicle, vehicleApi } from "@/lib/api/vehicle";

export default function DriverVehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await vehicleApi.getById(Number(id));
        setVehicle(res.data);
      } catch {
        toast.error("Failed to load vehicle");
      } finally {
        setLoading(false);
      }
    };

    void fetchVehicle();
  }, [id]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await maintenanceApi.getByVehicle(Number(id));
        setMaintenanceHistory(res.data);
      } catch {
        setMaintenanceHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    void fetchHistory();
  }, [id]);

  const closedRecords = maintenanceHistory.filter((record) => record.status === "CLOSED");
  const totalActualCost = closedRecords
    .filter((record) => record.actualCost != null)
    .reduce((sum, record) => sum + (record.actualCost ?? 0), 0);
  const totalDowntimeHours = closedRecords
    .filter((record) => record.downtimeHours != null)
    .reduce((sum, record) => sum + (record.downtimeHours ?? 0), 0);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DashboardShell>
    );
  }

  if (!vehicle) {
    return (
      <DashboardShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-slate-500">Vehicle not found.</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl animate-in fade-in duration-500">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboards/driver/vehicles")}
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vehicles
        </Button>

        <Card className="mb-6 overflow-hidden rounded-xl border-0 bg-white shadow-md ring-1 ring-slate-200/50">
          <CardHeader className="rounded-t-xl bg-blue-950 py-5">
            <CardTitle className="flex items-center gap-3 text-lg text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-blue-950">
                <Car className="h-5 w-5" />
              </div>
              {vehicle.brand} {vehicle.model}
              <div className="ml-auto">
                <VehicleStatusBadge status={vehicle.status} />
              </div>
            </CardTitle>
          </CardHeader>

          <div className="flex border-b border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "details"
                  ? "border-blue-950 text-blue-950"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Vehicle Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "history"
                  ? "border-blue-950 text-blue-950"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <History className="h-4 w-4" />
              Maintenance History
              {maintenanceHistory.length > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-xs text-white">
                  {maintenanceHistory.length}
                </span>
              )}
            </button>
          </div>

          <CardContent className="pt-6">
            {activeTab === "details" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <DetailCard icon={Hash} label="Plate Number" value={vehicle.plateNumber} />
                <DetailCard icon={Car} label="Vehicle Type" value={vehicle.vehicleType} />
                <DetailCard icon={Fuel} label="Fuel Type" value={vehicle.fuelType} />
                <DetailCard icon={Calendar} label="Year" value={String(vehicle.year)} />
                <DetailCard icon={Building} label="Department" value={vehicle.department || "Not assigned"} wide />

                {(vehicle.color || vehicle.seatingCapacity) && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Additional Details
                    </p>
                  </div>
                )}
                {vehicle.color && <DetailCard icon={Palette} label="Color" value={vehicle.color} />}
                {vehicle.seatingCapacity && (
                  <DetailCard icon={Users} label="Seating Capacity" value={`${vehicle.seatingCapacity} seats`} />
                )}

                {(vehicle.insuranceExpiryDate || vehicle.revenueLicenseExpiryDate) && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Compliance & Expiry Dates
                    </p>
                  </div>
                )}
                {vehicle.insuranceExpiryDate && (
                  <ExpiryCard icon={ShieldCheck} label="Insurance Expiry" date={vehicle.insuranceExpiryDate} />
                )}
                {vehicle.revenueLicenseExpiryDate && (
                  <ExpiryCard icon={FileCheck} label="Revenue License Expiry" date={vehicle.revenueLicenseExpiryDate} />
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-6">
                {!historyLoading && maintenanceHistory.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <SummaryCard icon={Wrench} label="Total Requests" value={String(maintenanceHistory.length)} />
                    <SummaryCard
                      icon={DollarSign}
                      label="Total Cost"
                      value={totalActualCost > 0 ? `Rs. ${totalActualCost.toLocaleString()}` : "-"}
                    />
                    <SummaryCard
                      icon={Clock}
                      label="Total Downtime"
                      value={formatDowntime(totalDowntimeHours)}
                    />
                  </div>
                )}

                {historyLoading ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading history...
                  </div>
                ) : maintenanceHistory.length === 0 ? (
                  <div className="py-12 text-center text-sm font-medium text-slate-400">
                    No maintenance records found for this vehicle.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl shadow-md ring-1 ring-slate-200/50">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-blue-950">
                        <tr>
                          {["Type", "Description", "Status", "Cost", "Downtime", "Date"].map((header) => (
                            <th key={header} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white/90">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {maintenanceHistory
                          .slice()
                          .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime())
                          .map((record) => (
                            <tr key={record.id} className="transition-colors hover:bg-slate-50/80">
                              <td className="px-5 py-3">
                                <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                                  {record.maintenanceType.replace(/_/g, " ")}
                                </span>
                              </td>
                              <td className="max-w-[220px] truncate px-5 py-3 text-slate-600">{record.description}</td>
                              <td className="px-5 py-3">
                                <MaintenanceStatusBadge status={record.status} />
                              </td>
                              <td className="px-5 py-3 text-xs text-slate-700">
                                {record.actualCost != null
                                  ? `Rs. ${Number(record.actualCost).toLocaleString()}`
                                  : record.estimatedCost != null
                                    ? `Est. Rs. ${Number(record.estimatedCost).toLocaleString()}`
                                    : "-"}
                              </td>
                              <td className="px-5 py-3 text-xs text-slate-700">
                                {record.downtimeHours != null ? formatDowntime(record.downtimeHours) : "-"}
                              </td>
                              <td className="px-5 py-3 text-xs text-slate-500">
                                {new Date(record.requestedDate).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
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
    </DashboardShell>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  wide,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl bg-slate-50/80 p-4 shadow-sm ring-1 ring-slate-100 ${wide ? "md:col-span-2" : ""}`}>
      <Icon className="h-5 w-5 text-blue-600" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function ExpiryCard({ icon: Icon, label, date }: { icon: React.ElementType; label: string; date: string }) {
  const expiry = new Date(date);
  const today = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft < 0;
  const isWarning = daysLeft >= 0 && daysLeft <= 30;

  return (
    <div className={`flex items-center gap-3 rounded-lg p-4 ${isExpired ? "bg-red-50" : isWarning ? "bg-amber-50" : "bg-slate-50"}`}>
      <Icon className={`h-5 w-5 ${isExpired ? "text-red-500" : isWarning ? "text-amber-500" : "text-blue-600"}`} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`font-semibold ${isExpired ? "text-red-700" : isWarning ? "text-amber-700" : "text-slate-900"}`}>
          {expiry.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        {isExpired && <p className="text-xs font-medium text-red-500">Expired {Math.abs(daysLeft)} days ago</p>}
        {isWarning && <p className="text-xs font-medium text-amber-500">Expires in {daysLeft} days</p>}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function formatDowntime(hours: number): string {
  if (hours <= 0) return "-";
  if (hours === 0) return "< 1h";
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return `${hours}h`;
}
