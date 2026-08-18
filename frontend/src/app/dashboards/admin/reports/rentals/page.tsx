"use client";

import { Button } from "@/components/ui/button";

import Link from "next/link";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car, DollarSign, Clock, Calendar } from "lucide-react";
import { reportService } from "@/services/reportService";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function RentalAnalyticsPage() {
    const [rentals, setRentals] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [rentalData, vehicleData] = await Promise.all([
                reportService.getRentalAnalytics(),
                reportService.getVehicles()
            ]);
            setRentals(rentalData);
            setVehicles(vehicleData);
        } catch (error) {
            console.error("Failed to load rental analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading analytics...</div>;

    const totalExpenses = rentals.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const avgDailyRate = rentals.length > 0 ? rentals.reduce((sum, r) => sum + (r.costPerDay || 0), 0) / rentals.length : 0;
    const totalDays = rentals.reduce((sum, r) => sum + (r.days || 0), 0);
    const activeRentals = rentals.filter(r => r.status === "ACTIVE").length;
    const rentalUtilization = rentals.length > 0 ? (activeRentals / rentals.length) * 100 : 0;

    const spendingData = rentals.map(r => ({
        name: r.startDate,
        amount: r.totalCost
    })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    const typeData = Array.from(new Set(rentals.map(r => r.vehicleType))).map(type => ({
        type,
        total: rentals.filter(r => r.vehicleType === type).reduce((sum, r) => sum + (r.totalCost || 0), 0),
    }));

    return (
        <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen animate-in fade-in duration-700">

            <div>
                <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900 -ml-4 mb-2">
                    <Link href="/dashboards/admin/reports">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Reports Dashboard
                    </Link>
                </Button>
            </div>

            {/* Header */}
            <PageHeader title="Rental Insights" description="Analyzing external vehicle costs, vendors, and utilization purposes" />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Expense</p>
                                <h3 className="mt-1 text-2xl font-bold text-slate-900">LKR {totalExpenses.toLocaleString()}</h3>
                            </div>
                            <div className="rounded-lg bg-amber-100 p-2 text-amber-800 ring-1 ring-amber-200">
                                <DollarSign className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-slate-500">Total across {rentals.length} rentals</div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Avg. Daily Rate</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">LKR {avgDailyRate.toFixed(2)}</h3>
                            </div>
                            <div className="rounded-lg bg-amber-100 p-2 text-amber-800 ring-1 ring-amber-200">
                                <Clock className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-slate-500">Average cost per day per vehicle</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Rental Days</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">{totalDays} Days</h3>
                            </div>
                            <div className="rounded-lg bg-amber-100 p-2 text-amber-800 ring-1 ring-amber-200">
                                <Calendar className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-slate-500">Total external utilization time</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Fleet Rented</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">{rentalUtilization.toFixed(0)}%</h3>
                            </div>
                            <div className="rounded-lg bg-amber-100 p-2 text-amber-800 ring-1 ring-amber-200">
                                <Car className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${rentalUtilization}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Spending Trajectory</CardTitle>
                        <CardDescription>Daily rental cost fluctuations</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {spendingData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={spendingData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} formatter={(val: any) => [`LKR ${Number(val).toLocaleString()}`, "Amount"]} />
                                    <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No spending data available</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Costs by Vehicle Type</CardTitle>
                        <CardDescription>Spend allocation across vehicle categories</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {typeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={typeData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} width={100} />
                                    <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "12px", border: "none" }} formatter={(val: any) => [`LKR ${Number(val).toLocaleString()}`, "Total Spend"]} />
                                    <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No vehicle type data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-slate-50">
                    <CardTitle className="text-lg">Rental History Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Vendor</th>
                                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                                    <th className="px-6 py-4 font-semibold">Plate</th>
                                    <th className="px-6 py-4 font-semibold">Duration</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total Cost</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {rentals.length > 0 ? rentals.map((rental) => (
                                    <tr key={rental.id} className="bg-white hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">{rental.vendorName || rental.vendorId || "-"}</td>
                                        <td className="px-6 py-4 text-slate-600">{rental.vehicleType || "-"}</td>
                                        <td className="px-6 py-4 text-slate-600">{rental.plateNumber || "-"}</td>
                                        <td className="px-6 py-4 text-slate-600">{rental.startDate || "-"} to {rental.endDate || "-"}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">LKR {(rental.totalCost || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                rental.status === "ACTIVE" ? "bg-indigo-100 text-indigo-700 border-none px-3 py-1" :
                                                rental.status === "RETURNED" ? "bg-emerald-100 text-emerald-700 border-none px-3 py-1" :
                                                rental.status === "CLOSED" ? "bg-slate-100 text-slate-700 border-none px-3 py-1" :
                                                "bg-red-50 text-red-600 border-none px-3 py-1"
                                            }>
                                                {rental.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No rental records found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
