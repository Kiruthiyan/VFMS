"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Fuel, 
    Wrench, 
    Navigation, 
    Activity,
    TrendingUp,
    Users,
    Truck,
    MapPin
} from "lucide-react";
import { reportService, DashboardStats } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await reportService.getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) return <div className="p-8">Loading Fleet Intelligence...</div>;

    const cards = [
        { label: "Total Fuel Cost", value: `$${stats.totalFuelCost.toLocaleString()}`, icon: Fuel, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Maintenance Spend", value: `$${stats.totalMaintenanceCost.toLocaleString()}`, icon: Wrench, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Fleet Distance", value: `${stats.totalDistance.toLocaleString()} km`, icon: Navigation, color: "text-green-600", bg: "bg-green-50" },
        { label: "Avg Efficiency", value: `${stats.avgEfficiency.toFixed(1)} km/L`, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">Real-time overview of fleet operations and expenditure</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Status</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-bold text-slate-700">Live Backend Connected</span>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">{card.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-2">{card.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Simplified Chart for Aesthetic Overflow */}
                 <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Operational Growth
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={Object.entries(stats?.monthlyDistances || {}).map(([name, dist]) => ({ name, dist }))}>
                                <defs>
                                    <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis hide />
                                <Tooltip />
                                <Area type="monotone" dataKey="dist" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDist)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>

                 <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-slate-900 text-white">
                        <CardContent className="pt-6">
                            <Users className="w-8 h-8 text-amber-400 mb-4" />
                            <h4 className="text-xl font-bold">Fleet Access</h4>
                            <p className="text-slate-400 text-sm mt-2">Manage driver permissions and department access levels.</p>
                            <button className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors">
                                View User Management
                            </button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Total Fleet Size</p>
                                    <p className="text-xl font-black text-slate-900">{stats.totalVehicles} Vehicles</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    );
}
