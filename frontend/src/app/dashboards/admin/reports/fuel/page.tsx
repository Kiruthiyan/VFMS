"use client";

import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Fuel, Navigation, Droplets, MapPin, Search, DollarSign, Car } from "lucide-react";
import { reportService } from "@/services/reportService";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, ComposedChart, Area, AreaChart } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const FUEL_TYPE_COLORS: Record<string, string> = {
    DIESEL: "#f59e0b",
    PETROL: "#3b82f6",
    UNKNOWN: "#94a3b8",
};

export default function FuelAnalysisPage() {
    const [fuelLogs, setFuelLogs] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState("");

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [logs, vehicleData] = await Promise.all([
                    reportService.getFuelLogs(),
                    reportService.getVehicles()
                ]);
                setFuelLogs(logs);
                setVehicles(vehicleData);
            } catch (error) {
                console.error("Failed to load fuel analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    if (loading) return <div className="p-8">Loading fuel analytics...</div>;

    // --- Vehicle fuel type map ---
    const vehicleFuelTypeMap = vehicles.reduce((map, vehicle) => {
        const key = String(vehicle.id ?? vehicle.vehicleId ?? vehicle.licensePlate ?? "");
        if (key) map.set(key, String(vehicle.fuelType ?? "UNKNOWN").toUpperCase());
        return map;
    }, new Map<string, string>());

    const logsWithFuelType = fuelLogs.map(log => ({
        ...log,
        fuelType: vehicleFuelTypeMap.get(String(log.vehicleId)) ?? "UNKNOWN",
    }));

    const filteredLogs = logsWithFuelType.filter(log =>
        (log.licensePlate || "").toLowerCase().includes(filterText.toLowerCase()) ||
        (log.fuelStation || "").toLowerCase().includes(filterText.toLowerCase())
    );

    // --- Overall KPIs ---
    const totalCost = fuelLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    const totalVolume = fuelLogs.reduce((sum, log) => sum + (log.fuelQuantity || 0), 0);
    const avgPrice = totalVolume > 0 ? totalCost / totalVolume : 0;

    // --- Fuel Type Summary ---
    const fuelTypes = Array.from(new Set(logsWithFuelType.map(l => l.fuelType))).filter(Boolean);
    const fuelTypeSummary = fuelTypes.map(type => {
        const typeLogs = logsWithFuelType.filter(l => l.fuelType === type);
        const volume = typeLogs.reduce((sum, l) => sum + (l.fuelQuantity || 0), 0);
        const cost = typeLogs.reduce((sum, l) => sum + (l.totalCost || 0), 0);
        const avgP = volume > 0 ? cost / volume : 0;
        return { type, volume, cost, avgPrice: avgP, count: typeLogs.length };
    });

    // --- Trajectory Chart Data ---
    const trajectoryData = fuelLogs.reduce((acc: any[], log) => {
        const date = new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const existing = acc.find(a => a.name === date);
        if (existing) {
            existing.costLKR += log.totalCost || 0;
            existing.litersL += log.fuelQuantity || 0;
        } else {
            acc.push({ name: date, costLKR: log.totalCost || 0, litersL: log.fuelQuantity || 0 });
        }
        return acc;
    }, []).sort((a, b) => {
        const [aMonth, aDay] = a.name.split(" ");
        const [bMonth, bDay] = b.name.split(" ");
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const aIdx = months.indexOf(aMonth) * 31 + parseInt(aDay || "0");
        const bIdx = months.indexOf(bMonth) * 31 + parseInt(bDay || "0");
        return aIdx - bIdx;
    });

    // --- Vendor Preference (by volume, not count) ---
    const stationVolume = fuelLogs.reduce((acc: any, log) => {
        const station = log.fuelStation || "Unknown";
        acc[station] = (acc[station] || 0) + (log.fuelQuantity || 0);
        return acc;
    }, {});
    const pieData = Object.entries(stationVolume).map(([name, value]) => ({ name, value: Number(value) }));

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


            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Fuel className="w-8 h-8 text-amber-500" />
                    Fuel Analysis Dashboard
                </h1>
                <p className="text-slate-500 mt-1">Operational intelligence on fuel consumption, costs, and fleet efficiency</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Expenditure</p>
                                <h3 className="text-3xl font-black text-slate-900 mt-2">LKR {totalCost.toLocaleString()}</h3>
                                <p className="text-[10px] font-bold mt-2 text-blue-600">{fuelLogs.length} transactions recorded</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><DollarSign className="w-6 h-6" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Volume</p>
                                <h3 className="text-3xl font-black text-slate-900 mt-2">{totalVolume.toLocaleString()} L</h3>
                                <p className="text-[10px] font-bold mt-2 text-amber-600">Total litres consumed</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600"><Droplets className="w-6 h-6" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Fuel Type Summary */}
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Fuel Type Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fuelTypeSummary.length > 0 ? fuelTypeSummary.map((ft) => (
                        <Card key={ft.type} className="border-none shadow-sm">
                            <CardContent className="pt-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FUEL_TYPE_COLORS[ft.type] || "#94a3b8" }} />
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-wider">{ft.type}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Transactions</p>
                                        <p className="text-lg font-black text-slate-900 mt-1">{ft.count}</p>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Volume (L)</p>
                                        <p className="text-lg font-black text-slate-900 mt-1">{ft.volume.toLocaleString()}</p>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Cost (LKR)</p>
                                        <p className="text-lg font-black text-slate-900 mt-1">{ft.cost.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <p className="text-slate-400 col-span-3">No fuel type data available</p>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Consumption and Cost Trajectory</CardTitle>
                        <CardDescription>Daily fuel volume (L) vs total cost (LKR)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {trajectoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={trajectoryData}>
                                    <defs>
                                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} label={{ value: "LKR", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} label={{ value: "Litres", angle: 90, position: "insideRight", fill: "#94a3b8", fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} formatter={(value: any, name: any) => name === "Total Cost (LKR)" ? [`LKR ${Number(value).toLocaleString()}`, name] : [`${Number(value).toLocaleString()} L`, name]} />
                                    <Legend />
                                    <Area yAxisId="left" type="monotone" dataKey="costLKR" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} name="Total Cost (LKR)" />
                                    <Bar yAxisId="right" dataKey="litersL" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Volume (L)" barSize={25} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No fuel data available</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Vendor Preference</CardTitle>
                        <CardDescription>Fuel volume (L) per station</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex flex-col justify-center items-center">
                        {pieData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} L`, "Volume"]} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-1 gap-2 mt-4 w-full px-4">
                                    {pieData.map((item, index) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                <span className="text-[11px] font-bold text-slate-500 uppercase truncate">{item.name}</span>
                                            </div>
                                            <span className="text-[11px] font-black text-slate-700">{Number(item.value).toLocaleString()} L</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-slate-400">No station data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Fuel Log Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <div>
                        <CardTitle>Fuel Log Registry</CardTitle>
                        <CardDescription>Detailed audit of every fuel transaction recorded</CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input placeholder="Filter by vehicle or station..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Fuel Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Volume (L)</th>
                                    <th className="px-6 py-4">Price / L</th>
                                    <th className="px-6 py-4">Total Cost</th>
                                    <th className="px-6 py-4">Odometer</th>
                                    <th className="px-6 py-4">Station</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredLogs.length > 0 ? filteredLogs.map((log, index) => (
                                    <tr key={log.id || index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-blue-950 shadow-sm ring-1 ring-black/5">
                                                    <Car className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{log.licensePlate}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold">ID: {log.vehicleId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className="whitespace-nowrap border-none bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-100">
                                                {log.fuelType}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{log.date}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{log.fuelQuantity} L</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">LKR {log.pricePerLiter}</td>
                                        <td className="px-6 py-4">
                                            <Badge className="bg-slate-100 text-slate-900 hover:bg-slate-100 border-none px-2 py-0.5 font-black">
                                                LKR {log.totalCost}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{(log.odometer || 0).toLocaleString()} km</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="font-medium">{log.fuelStation}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-slate-400">No fuel records found</td>
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
