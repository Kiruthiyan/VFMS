"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    TrendingUp,
    DollarSign,
    Droplets,
    Loader2,
    Car,
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    Calendar,
    Fuel
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

interface FuelRecord {
    id: number;
    vehicleId: number;
    quantity: number;
    cost: number;
    mileage: number;
    date: string;
    stationName?: string;
}

interface Vehicle {
    id: number;
    make: string;
    model: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function FuelAnalyticsPage() {
    const [stats, setStats] = useState({
        totalCost: 0,
        totalVolume: 0,
        avgCostPerLiter: 0,
        totalRecords: 0,
        thisMonthCost: 0,
        lastMonthCost: 0,
        avgFillup: 0
    });
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [vehicleData, setVehicleData] = useState<any[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [topStations, setTopStations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [recordsRes, vehiclesRes] = await Promise.all([
                    api.get("/fuel"),
                    api.get("/vehicles")
                ]);

                const records: FuelRecord[] = recordsRes.data || [];
                const vehicles: Vehicle[] = vehiclesRes.data || [];

                if (records.length === 0) {
                    setLoading(false);
                    return;
                }

                // Calculate overall stats
                const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
                const totalVolume = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
                const avgCostPerLiter = totalVolume > 0 ? totalCost / totalVolume : 0;
                const avgFillup = records.length > 0 ? totalVolume / records.length : 0;

                // This month vs last month
                const now = new Date();
                const thisMonth = now.getMonth();
                const thisYear = now.getFullYear();

                const thisMonthCost = records.filter(r => {
                    const d = new Date(r.date);
                    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
                }).reduce((sum, r) => sum + (r.cost || 0), 0);

                const lastMonthCost = records.filter(r => {
                    const d = new Date(r.date);
                    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
                    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
                    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
                }).reduce((sum, r) => sum + (r.cost || 0), 0);

                setStats({
                    totalCost,
                    totalVolume,
                    avgCostPerLiter,
                    totalRecords: records.length,
                    thisMonthCost,
                    lastMonthCost,
                    avgFillup
                });

                // Monthly cost and volume data
                const monthlyMap = new Map<string, { cost: number, volume: number }>();
                records.forEach(record => {
                    const date = new Date(record.date);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });

                    if (!monthlyMap.has(month)) {
                        monthlyMap.set(month, { cost: 0, volume: 0 });
                    }
                    const data = monthlyMap.get(month)!;
                    data.cost += record.cost || 0;
                    data.volume += record.quantity || 0;
                });

                const monthly = Array.from(monthlyMap.entries())
                    .map(([name, data]) => ({
                        name,
                        cost: Number(data.cost.toFixed(2)),
                        volume: Number(data.volume.toFixed(1))
                    }))
                    .slice(-6); // Last 6 months

                setMonthlyData(monthly);

                // Vehicle-wise breakdown
                const vehicleMap = new Map<number, { name: string, cost: number, volume: number, count: number }>();
                records.forEach(record => {
                    const vehicle = vehicles.find(v => v.id === record.vehicleId);
                    const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model}` : `Vehicle ${record.vehicleId}`;

                    if (!vehicleMap.has(record.vehicleId)) {
                        vehicleMap.set(record.vehicleId, { name: vehicleName, cost: 0, volume: 0, count: 0 });
                    }
                    const data = vehicleMap.get(record.vehicleId)!;
                    data.cost += record.cost || 0;
                    data.volume += record.quantity || 0;
                    data.count += 1;
                });

                const vehicleBreakdown = Array.from(vehicleMap.values())
                    .map(v => ({
                        name: v.name,
                        cost: Number(v.cost.toFixed(2)),
                        volume: Number(v.volume.toFixed(1)),
                        fillups: v.count
                    }))
                    .sort((a, b) => b.cost - a.cost)
                    .slice(0, 8);

                setVehicleData(vehicleBreakdown);

                // Trend data (last 10 records)
                const trend = [...records]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(-10)
                    .map(r => ({
                        date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        cost: r.cost,
                        volume: r.quantity,
                        pricePerLiter: r.quantity > 0 ? (r.cost / r.quantity) : 0
                    }));

                setTrendData(trend);

                // Top stations
                const stationMap = new Map<string, { cost: number, count: number }>();
                records.forEach(record => {
                    if (record.stationName) {
                        if (!stationMap.has(record.stationName)) {
                            stationMap.set(record.stationName, { cost: 0, count: 0 });
                        }
                        const data = stationMap.get(record.stationName)!;
                        data.cost += record.cost || 0;
                        data.count += 1;
                    }
                });

                const stations = Array.from(stationMap.entries())
                    .map(([name, data]) => ({
                        name,
                        cost: Number(data.cost.toFixed(2)),
                        visits: data.count
                    }))
                    .sort((a, b) => b.cost - a.cost)
                    .slice(0, 5);

                setTopStations(stations);

            } catch (error) {
                console.error("Failed to fetch analytics:", error);
                toast.error("Failed to load analytics data");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const monthlyChange = stats.lastMonthCost > 0
        ? ((stats.thisMonthCost - stats.lastMonthCost) / stats.lastMonthCost * 100).toFixed(1)
        : '0';
    const isIncrease = Number(monthlyChange) > 0;

    return (
        <ModuleLayout title="Fuel Analytics Dashboard">
            <div className="space-y-6">
                {/* Header Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Spend</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        ${loading ? '...' : stats.totalCost.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500">{stats.totalRecords} records</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Volume</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        {loading ? '...' : stats.totalVolume.toFixed(1)} <span className="text-xl text-slate-500">L</span>
                                    </p>
                                    <p className="text-xs text-slate-500">Avg: {stats.avgFillup.toFixed(1)}L per fillup</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <Droplets className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Avg Price</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        ${loading ? '...' : stats.avgCostPerLiter.toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500">Per liter</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Fuel className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">This Month</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        ${loading ? '...' : stats.thisMonthCost.toFixed(2)}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {isIncrease ? (
                                            <TrendingUp className="h-3 w-3 text-red-500" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-green-500" />
                                        )}
                                        <p className={`text-xs font-semibold ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                                            {isIncrease ? '+' : ''}{monthlyChange}% vs last month
                                        </p>
                                    </div>
                                </div>
                                <div className="w-12 h12 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <Tabs defaultValue="trends" className="w-full">
                    <TabsList className="bg-slate-100">
                        <TabsTrigger value="trends">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Trends
                        </TabsTrigger>
                        <TabsTrigger value="vehicles">
                            <Car className="h-4 w-4 mr-2" />
                            By Vehicle
                        </TabsTrigger>
                        <TabsTrigger value="breakdown">
                            <PieChartIcon className="h-4 w-4 mr-2" />
                            Breakdown
                        </TabsTrigger>
                    </TabsList>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Monthly Cost Trend</CardTitle>
                                    <CardDescription>Spending over the last 6 months</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={monthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                                                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="cost"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    dot={{ fill: '#3b82f6', r: 5 }}
                                                    activeDot={{ r: 7 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Volume Consumption</CardTitle>
                                    <CardDescription>Liters consumed monthly</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlyData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                                                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                />
                                                <Bar dataKey="volume" fill="#10b981" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Price Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Price Per Liter Trend</CardTitle>
                                <CardDescription>Recent fuel price variations</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[250px]">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="pricePerLiter"
                                                stroke="#f59e0b"
                                                strokeWidth={2}
                                                name="Price/L"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* By Vehicle Tab */}
                    <TabsContent value="vehicles" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Cost By Vehicle</CardTitle>
                                <CardDescription>Total spending per vehicle</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[400px]">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={vehicleData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                                            <YAxis dataKey="name" type="category" width={150} stroke="#64748b" style={{ fontSize: '12px' }} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Bar dataKey="cost" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top Stations */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Top Fuel Stations</CardTitle>
                                <CardDescription>Most frequented stations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                        </div>
                                    ) : topStations.length === 0 ? (
                                        <p className="text-center text-slate-500 py-8">No station data available</p>
                                    ) : (
                                        topStations.map((station, idx) => (
                                            <div key={station.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{station.name}</p>
                                                        <p className="text-xs text-slate-500">{station.visits} visits</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-slate-900">${station.cost.toFixed(2)}</p>
                                                    <p className="text-xs text-slate-500">total spent</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Breakdown Tab */}
                    <TabsContent value="breakdown" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Cost Distribution</CardTitle>
                                    <CardDescription>Spending by vehicle</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[350px]">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={vehicleData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={(entry) => `${entry.name.split(' ')[0]}`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="cost"
                                                >
                                                    {vehicleData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#fff',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Vehicle Summary</CardTitle>
                                    <CardDescription>Detailed breakdown</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {loading ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                                            </div>
                                        ) : vehicleData.length === 0 ? (
                                            <p className="text-center text-slate-500 py-8">No vehicle data available</p>
                                        ) : (
                                            vehicleData.map((vehicle, idx) => (
                                                <div key={vehicle.name} className="flex items-center justify-between p-3 border-l-4 bg-slate-50 rounded-r-lg" style={{ borderColor: COLORS[idx % COLORS.length] }}>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-slate-900">{vehicle.name}</p>
                                                        <p className="text-xs text-slate-500">{vehicle.fillups} fillups • {vehicle.volume}L total</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-slate-900">${vehicle.cost.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ModuleLayout>
    );
}
