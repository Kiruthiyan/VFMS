"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Truck, 
    Navigation, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    BarChart3,
    Calendar,
    ArrowUpRight,
    PlayCircle,
    Activity
} from "lucide-react";
import { reportService, VehicleUtilization, TripStats } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function UtilizationPage() {
    const [utilizationData, setUtilizationData] = useState<VehicleUtilization[]>([]);
    const [tripStats, setTripStats] = useState<TripStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [uResult, tResult] = await Promise.all([
                reportService.getVehicleUtilization(),
                reportService.getTripStats()
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

    // --- Data Formatting ---
    const deptData = [
        { name: 'Logistics', requests: 85 },
        { name: 'Corporate', requests: 42 },
        { name: 'Staff Tx', requests: 64 },
        { name: 'Operations', requests: 38 },
        { name: 'Marketing', requests: 16 },
    ];

    const statusData = [
        { name: 'Approved', value: tripStats.approved },
        { name: 'Rejected', value: tripStats.rejected },
    ];

    const completionTrend = [
        { name: 'Mon', completed: 25, cancelled: 2 },
        { name: 'Tue', completed: 32, cancelled: 4 },
        { name: 'Wed', completed: 28, cancelled: 1 },
        { name: 'Thu', completed: 35, cancelled: 3 },
        { name: 'Fri', completed: 42, cancelled: 5 },
        { name: 'Sat', completed: 18, cancelled: 2 },
        { name: 'Sun', completed: 12, cancelled: 0 },
    ];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trip Management Analytics</h1>
                    <p className="text-slate-500 mt-1">Operational lifecycle reporting and vehicle utilization metrics</p>
                </div>
                <Badge className="bg-slate-900 text-white px-4 py-1.5 rounded-full flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Overall Fleet Utilization: 84%
                </Badge>
            </div>

            {/* Trip Lifecycle KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Requests', value: tripStats.total, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending Approval', value: tripStats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Active Trips', value: tripStats.active, icon: PlayCircle, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Completed', value: tripStats.completed, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                {/* Trip Request Analysis - Bar Chart */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Trip Request Distribution</CardTitle>
                        <CardDescription>Frequency of transport requests by organizational department</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} name="Total Requests" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Execution & Trend - Area Chart */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Trip Execution Velocity</CardTitle>
                        <CardDescription>Daily completion vs cancellation patterns over a 7-day window</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={completionTrend}>
                                <defs>
                                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorComp)" strokeWidth={3} name="Completed" />
                                <Area type="monotone" dataKey="cancelled" stroke="#ef4444" fill="transparent" strokeWidth={2} name="Cancelled" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Approval Rate Pie Chart */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Staff Approval Efficiency</CardTitle>
                        <CardDescription>Ratio of approved requests vs rejections</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col justify-center items-center">
                        <ResponsiveContainer width="100%" height="200px">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-center">
                            <p className="text-2xl font-bold text-slate-900">
                                {((tripStats.approved + tripStats.rejected) > 0 
                                    ? ((tripStats.approved / (tripStats.approved + tripStats.rejected)) * 100) 
                                    : 0).toFixed(1)}%
                            </p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Aggregate Approval Rate</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Utilization Registry Table */}
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
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
                                        <th className="px-6 py-4">Efficiency</th>
                                        <th className="px-6 py-4 text-center">Utilization</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {utilizationData.map((v) => (
                                        <tr key={v.vehicleId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                        <Truck className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-bold text-slate-900">{v.licensePlate}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-semibold text-slate-700">{v.totalTrips}</td>
                                            <td className="px-6 py-4 text-slate-600">{v.totalDistance} km</td>
                                            <td className="px-6 py-4">
                                                <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none font-bold">
                                                    92% Load
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[80px]">
                                                        <div 
                                                            className="bg-amber-500 h-full rounded-full" 
                                                            style={{ width: '78%' }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-900">78%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
