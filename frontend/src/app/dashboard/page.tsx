"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { vehicleApi } from "@/lib/api/vehicle";
import { maintenanceApi } from "@/lib/api/maintenance";
import { rentalApi } from "@/lib/api/rental";
import { useRole } from "@/lib/role-context";
import {
  Car, Wrench, TruckIcon, Clock, AlertTriangle,
  CheckCircle2, ArrowRight, ShieldCheck,
} from "lucide-react";

interface Stats {
  totalVehicles: number;
  availableVehicles: number;
  underMaintenance: number;
  pendingApprovals: number;
  activeRentals: number;
  openMaintenanceRequests: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { role, canApprove } = useRole();
  const [stats, setStats] = useState<Stats>({
    totalVehicles: 0,
    availableVehicles: 0,
    underMaintenance: 0,
    pendingApprovals: 0,
    activeRentals: 0,
    openMaintenanceRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [vehiclesRes, maintenanceRes, rentalsRes] = await Promise.allSettled([
          vehicleApi.getAll(),
          maintenanceApi.getAll(),
          rentalApi.getAll(),
        ]);

        const vehicles = vehiclesRes.status === "fulfilled" ? vehiclesRes.value.data : [];
        const maintenance = maintenanceRes.status === "fulfilled" ? maintenanceRes.value.data : [];
        const rentals = rentalsRes.status === "fulfilled" ? rentalsRes.value.data : [];

        setStats({
          totalVehicles: vehicles.length,
          availableVehicles: vehicles.filter((v) => v.status === "AVAILABLE").length,
          underMaintenance: vehicles.filter((v) => v.status === "UNDER_MAINTENANCE").length,
          pendingApprovals: maintenance.filter((m) => m.status === "SUBMITTED").length,
          activeRentals: rentals.filter((r) => r.status === "ACTIVE").length,
          openMaintenanceRequests: maintenance.filter((m) =>
            ["NEW", "SUBMITTED", "APPROVED"].includes(m.status)
          ).length,
        });
      } catch {
        // silently fail — stats are best-effort
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const roleGreeting: Record<string, string> = {
    ADMIN: "Full system access enabled.",
    SYSTEM_USER: "You can create and submit requests.",
    APPROVER: "Review pending requests below.",
    DRIVER: "View your assigned trips and details.",
  };

  const statCards = [
    {
      label: "Total Vehicles",
      value: stats.totalVehicles,
      icon: <Car className="h-5 w-5" />,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
      action: () => router.push("/dashboard/vehicles"),
    },
    {
      label: "Available",
      value: stats.availableVehicles,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
      action: () => router.push("/dashboard/vehicles"),
    },
    {
      label: "Under Maintenance",
      value: stats.underMaintenance,
      icon: <Wrench className="h-5 w-5" />,
      color: "bg-amber-50 text-amber-600",
      border: "border-amber-100",
      action: () => router.push("/dashboard/maintenance"),
    },
    {
      label: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-red-50 text-red-600",
      border: "border-red-100",
      action: () => router.push("/dashboard/maintenance?status=SUBMITTED"),
    },
    {
      label: "Active Rentals",
      value: stats.activeRentals,
      icon: <TruckIcon className="h-5 w-5" />,
      color: "bg-purple-50 text-purple-600",
      border: "border-purple-100",
      action: () => router.push("/dashboard/rentals"),
    },
    {
      label: "Open Requests",
      value: stats.openMaintenanceRequests,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-orange-50 text-orange-600",
      border: "border-orange-100",
      action: () => router.push("/dashboard/maintenance"),
    },
  ];

  const quickActions = [
    ...(["ADMIN", "SYSTEM_USER"].includes(role)
      ? [
          { label: "New Maintenance Request", href: "/dashboard/maintenance/create", icon: <Wrench className="h-4 w-4" /> },
          { label: "Register Vehicle", href: "/dashboard/vehicles/add", icon: <Car className="h-4 w-4" /> },
          { label: "New Rental", href: "/dashboard/rentals/create", icon: <TruckIcon className="h-4 w-4" /> },
        ]
      : []),
    ...(canApprove
      ? [{ label: "Review Pending Approvals", href: "/dashboard/maintenance?status=SUBMITTED", icon: <ShieldCheck className="h-4 w-4" /> }]
      : []),
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] rounded-2xl p-7 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg">
            <TruckIcon className="h-5 w-5 text-blue-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome to FleetPro</h1>
            <p className="text-slate-400 text-sm">{roleGreeting[role]}</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm mt-3 max-w-lg">
          Your central hub for managing vehicles, maintenance requests, and rentals.
          Use the sidebar to navigate between modules.
        </p>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-4">Fleet Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <button
              key={card.label}
              onClick={card.action}
              className={`bg-white rounded-xl p-5 border ${card.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left group`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "—" : card.value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-700 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-blue-950 hover:text-white hover:border-blue-950 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Module Status */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-4">System Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: "Vehicle Management", status: "active" },
            { name: "Maintenance & Repairs", status: "active" },
            { name: "Rentals & Vendors", status: "active" },
            { name: "Fuel Management", status: "coming" },
            { name: "Drivers & Staff", status: "coming" },
            { name: "Trip Scheduling", status: "coming" },
            { name: "Reports & Analytics", status: "coming" },
            { name: "User Management", status: "coming" },
          ].map((mod) => (
            <div
              key={mod.name}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                mod.status === "active"
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-slate-50 border-slate-100 opacity-60"
              }`}
            >
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                mod.status === "active" ? "bg-emerald-500" : "bg-slate-400"
              }`} />
              <span className="text-xs font-medium text-slate-700">{mod.name}</span>
              {mod.status === "coming" && (
                <span className="ml-auto text-[9px] font-semibold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">
                  SOON
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
