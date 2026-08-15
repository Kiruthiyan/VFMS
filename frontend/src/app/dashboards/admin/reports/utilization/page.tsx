"use client";

import { Button } from "@/components/ui/button";

import Link from "next/link";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car, CheckCircle2, Clock, Calendar, PlayCircle, XCircle } from "lucide-react";
import { reportService, VehicleUtilization, TripStats } from "@/services/reportService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function UtilizationPage() {
    const [utilizationData, setUtilizationData] = useState<VehicleUtilization[]>([]);
    const [tripStats, setTripStats] = useState<TripStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [uResult, tResult] = await Promise.all([
                reportService.getVehicleUtilization(),
                reportService.getTripStats(),
            ]);
            setUtilizationData(uResult);
            setTripStats(tResult);
        } catch (error) {
            console.error("Failed to load utilization data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !tripStats) return <div className="p-8">Loading trip analytics...</div>;

    const approvalTotal = tripStats.approved + tripStats.rejected;
    const approvalRate = approvalTotal > 0 ? (tripStats.approved / approvalTotal) * 100 : 0;
    const totalFleetTrips = utilizationData.reduce((sum, v) => sum + (v.totalTrips || 0), 0);
    const maxTrips = utilizationData.length > 0 ? Math.max(...utilizationData.map(v => v.totalTrips || 0)) : 1;

    // Chart 1 - Trip status breakdown from real tripStats
    const tripStatusData = [
        { name: "Pending", value: tripStats.pending, fill: "#f59e0b" },
        { name: "Active", value: tripStats.active, fill: "#3b82f6" },
        { name: "Completed", value: tripStats.completed, fill: "#10b981" },
        { name: "Cancelled", value: tripStats.cancelled, fill: "#ef4444" },
        { name: "Rejected", value: tripStats.rejected, fill: "#6b7280" },
    ].filter(d => d.value > 0);

    // Chart 2 - Vehicle trip distribution from real utilization data
    const vehicleBarData = utilizationData.slice(0, 8).map(v => ({
        name: v.licensePlate || "Unknown",
        trips: v.totalTrips || 0,
    }));

    // Chart 3 - Approval data
    const statusData = [
        { name: "Approved", value: tripStats.approved },
        { name: "Rejected", value: tripStats.rejected },
    ];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">

            <div>
                <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900 -ml-4 mb-2">
                    <Link href="/dashboards/admin/reports">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Reports Dashboard
                    </Link>
                </Button>
            </div>

            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vehicle Utilization Analytics</h1>
                <p className="text-slate-500 mt-1">Fleet workload distribution and trip lifecycle metrics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Requests", value: tripStats.total, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending Approval", value: tripStats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Active Trips", value: tripStats.active, icon: PlayCircle, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Completed", value: tripStats.completed, icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900 mt-2">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1 - Trip Status Breakdown */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Trip Status Breakdown</CardTitle>
                        <CardDescription>Distribution of all trip requests by current status</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {tripStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={tripStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: "transparent" }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} name="Trips">
                                        {tripStatusData.map((entry, index) => (
                                            <Cell key={index} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No trip data available</div>
                        )}
                    </CardContent>
                </Card>

                {/* Chart 2 - Vehicle Trip Distribution */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Vehicle Trip Distribution</CardTitle>
                        <CardDescription>Number of trips assigned per vehicle</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {vehicleBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={vehicleBarData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: "transparent" }} />
                                    <Bar dataKey="trips" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} name="Total Trips" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No vehicle data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Chart 3 - Staff Approval Efficiency */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Staff Approval Efficiency</CardTitle>
                    <CardDescription>Ratio of approved requests vs rejections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_180px] lg:items-center">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Approved</p>
                                    <p className="mt-1 text-2xl font-black text-emerald-700">{tripStats.approved}</p>
                                </div>
                                <div className="rounded-2xl bg-rose-50 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-700">Rejected</p>
                                    <p className="mt-1 text-2xl font-black text-rose-700">{tripStats.rejected}</p>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aggregate Approval Rate</p>
                                <p className="mt-1 text-3xl font-black text-slate-900">{approvalRate.toFixed(1)}%</p>
                                <p className="text-xs text-slate-500">{approvalTotal} total review decisions</p>
                            </div>
                        </div>
                        <div className="relative mx-auto h-[180px] w-[180px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={58} outerRadius={78} paddingAngle={6} dataKey="value" startAngle={90} endAngle={-270}>
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-slate-900">{approvalRate.toFixed(0)}%</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Approved</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fleet Utilization Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg">Fleet Utilization Registry</CardTitle>
                    <CardDescription>Individual vehicle workload and mileage metrics</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Vehicle Plate</th>
                                    <th className="px-6 py-4 text-center">Trips</th>
                                    <th className="px-6 py-4">Total Distance</th>
                                    <th className="px-6 py-4">Km / Trip</th>
                                    <th className="px-6 py-4">Utilization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {utilizationData.length > 0 ? utilizationData.map((v) => {
                                    const kmPerTrip = v.totalTrips > 0 ? v.totalDistance / v.totalTrips : 0;
                                    const tripShare = totalFleetTrips > 0 ? (v.totalTrips / totalFleetTrips) * 100 : 0;
                                    return (
                                        <tr key={v.vehicleId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-blue-950 shadow-sm ring-1 ring-black/5">
                                                        <Car className="h-5 w-5" />
                                                    </div>
                                                    <span className="font-bold text-slate-900">{v.licensePlate}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-slate-700">{v.totalTrips}</td>
                                            <td className="px-6 py-4 text-slate-600">{(v.totalDistance || 0).toLocaleString()} km</td>
                                            <td className="px-6 py-4">
                                                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none font-bold">
                                                    {kmPerTrip.toFixed(1)} km/trip
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[80px]">
                                                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(tripShare, 100)}%` }} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-900">{tripShare.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No utilization data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
