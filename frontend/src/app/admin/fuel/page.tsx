"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, AlertCircle, FileText, TrendingUp, Fuel, Users, Plus } from "lucide-react";
import Link from "next/link";
import {
  getAllFuelRecordsApi,
  getErrorMessage,
  extractUniqVehicles,
  extractUniqueDrivers,
  type FuelRecord,
} from "@/lib/api/fuel";
import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FuelDashboardPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vehicles = extractUniqVehicles(records);
  const drivers = extractUniqueDrivers(records);
  const totalSpend = records.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const totalVolume = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const avgCostPerLiter = totalVolume > 0 ? (totalSpend / totalVolume).toFixed(2) : "0.00";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllFuelRecordsApi();
      setRecords(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return (
    <AdminShell>
      <div className="space-y-6">
          {/* Page Header */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="mb-2 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Fuel Management Dashboard
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Monitor fuel consumption, costs, and fleet efficiency at a glance
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-24">
              <div className="text-center">
                <LoadingSpinner size={32} className="mx-auto mb-4 text-slate-950" />
                <p className="text-sm font-medium text-slate-600">Loading dashboard data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <FormMessage type="error" message={error} />
          )}

          {/* Dashboard Content */}
          {!loading && !error && (
            <>
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {/* Total Records KPI */}
                <Card className="overflow-hidden hover:shadow-md">
                  <CardHeader className="bg-slate-950 py-4 border-b-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white tracking-wider uppercase">
                        Total Records
                      </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400">
                          <Fuel size={18} className="text-slate-950" strokeWidth={2.5} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-5">
                    <p className="text-4xl font-bold text-slate-900">{records.length}</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">Fuel entries tracked</p>
                  </CardContent>
                </Card>

                {/* Total Spend KPI */}
                <Card className="overflow-hidden hover:shadow-md">
                  <CardHeader className="bg-slate-950 py-4 border-b-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white tracking-wider uppercase">
                        Total Spend
                      </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400">
                          <TrendingUp size={18} className="text-slate-950" strokeWidth={2.5} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-5">
                    <p className="text-4xl font-bold text-slate-900">LKR {(totalSpend / 1000).toFixed(1)}k</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">Total fuel cost</p>
                  </CardContent>
                </Card>

                {/* Total Volume KPI */}
                <Card className="overflow-hidden hover:shadow-md">
                  <CardHeader className="bg-slate-950 py-4 border-b-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white tracking-wider uppercase">
                        Total Volume
                      </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400">
                          <Fuel size={18} className="text-slate-950" strokeWidth={2.5} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-5">
                    <p className="text-4xl font-bold text-slate-900">{totalVolume.toFixed(0)}L</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">Liters dispensed</p>
                  </CardContent>
                </Card>

                {/* Avg Cost per Liter KPI */}
                <Card className="overflow-hidden hover:shadow-md">
                  <CardHeader className="bg-slate-950 py-4 border-b-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white tracking-wider uppercase">
                        Avg Cost/L
                      </CardTitle>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400">
                          <TrendingUp size={18} className="text-slate-950" strokeWidth={2.5} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-5">
                    <p className="text-4xl font-bold text-slate-900">LKR {avgCostPerLiter}</p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">Cost per liter</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Access Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {/* Fuel Entry Logs */}
                <Link href="/admin/fuel/logs" className="group">
                  <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 transition-colors group-hover:bg-amber-100">
                          <FileText size={22} className="text-slate-950" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">VIEW</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 text-sm">Fuel Entry Logs</h3>
                      <p className="text-xs text-slate-600">View and filter all fuel entry records with details</p>
                    </CardContent>
                  </Card>
                </Link>

                {/* Create New Entry */}
                <Link href="/admin/fuel/create" className="group">
                  <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 transition-colors group-hover:bg-amber-100">
                          <Plus size={22} className="text-slate-950" strokeWidth={2.5} />
                        </div>
                        <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">NEW</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 text-sm">Create Fuel Entry</h3>
                      <p className="text-xs text-slate-600">Log a new fuel purchase for your vehicles</p>
                    </CardContent>
                  </Card>
                </Link>

                {/* Fuel Alerts */}
                <Link href="/admin/fuel/alerts" className="group">
                  <Card className="h-full cursor-pointer transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 transition-colors group-hover:bg-amber-100">
                          <AlertCircle size={22} className="text-slate-950" strokeWidth={1.5} />
                        </div>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">MONITOR</span>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 text-sm">Fuel Alerts</h3>
                      <p className="text-xs text-slate-600">Monitor flagged records and suspicious patterns</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Fleet Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Active Vehicles */}
                <Card>
                  <CardHeader className="bg-slate-950 py-5 border-b border-slate-200">
                    <CardTitle className="text-white font-bold text-base flex items-center gap-2">
                      <Fuel size={18} />
                      Fleet Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                        <span className="text-slate-700 text-sm font-medium">Active Vehicles</span>
                        <span className="text-2xl font-bold text-slate-950">{vehicles.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 text-sm font-medium">Active Drivers</span>
                        <span className="text-2xl font-bold text-slate-950">{drivers.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader className="bg-slate-950 py-5 border-b border-slate-200">
                    <CardTitle className="text-white font-bold text-base flex items-center gap-2">
                      <BarChart3 size={18} />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                        <span className="text-slate-700 text-sm font-medium">Records per Vehicle</span>
                        <span className="text-2xl font-bold text-slate-950">
                          {vehicles.length > 0 ? (records.length / vehicles.length).toFixed(1) : "0"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700 text-sm font-medium">Avg Spend per Vehicle</span>
                        <span className="text-lg font-bold text-slate-950">
                          LKR {vehicles.length > 0 ? (totalSpend / vehicles.length).toFixed(0) : "0"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
      </div>
    </AdminShell>
  );
}
