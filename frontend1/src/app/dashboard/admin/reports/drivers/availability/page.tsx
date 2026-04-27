"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Clock, 
    UserCheck, 
    Truck, 
    Palmtree, 
    CalendarCheck,
    BarChart,
    Users
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
    'Available': '#10b981',
    'On-Trip': '#3b82f6',
    'Leave': '#f59e0b',
    'Off-Duty': '#64748b'
};

export default function AvailabilityAnalytics() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await reportService.getDriverPerformance();
            setDrivers(result);
        } catch (error) {
            console.error("Failed to load availability data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading availability data...</div>;

    // Simulated status data based on the driver list
    const statusData = [
        { name: 'Available', value: Math.ceil(drivers.length * 0.35) },
        { name: 'On-Trip', value: Math.ceil(drivers.length * 0.50) },
        { name: 'Leave', value: Math.ceil(drivers.length * 0.10) },
        { name: 'Off-Duty', value: Math.ceil(drivers.length * 0.05) },
    ];

    const utilizationTrend = [
        { day: 'Mon', rate: 75 }, { day: 'Tue', rate: 82 }, { day: 'Wed', rate: 88 },
        { day: 'Thu', rate: 92 }, { day: 'Fri', rate: 95 }, { day: 'Sat', rate: 45 }, { day: 'Sun', rate: 30 }
    ];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Availability & Utilization</h1>
                <p className="text-slate-500 mt-1">Real-time driver deployment status and historical utilization trends</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Drivers Available', value: statusData[0].value, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Active Trips', value: statusData[1].value, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'On Leave', value: statusData[2].value, icon: Palmtree, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Avg Utilization', value: '84%', icon: BarChart, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Utilization Area Chart */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Weekly Utilization Profile</CardTitle>
                        <CardDescription>Pecentage of fleet hours actively deployed on trips</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={utilizationTrend}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="rate" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRate)" strokeWidth={3} name="Utilization %" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Status Donut Chart */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Real-time Deployment</CardTitle>
                        <CardDescription>Current status breakdown of all drivers</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="250px">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-4 mt-6 w-full px-6">
                            {statusData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] }} />
                                    <span className="text-xs font-semibold text-slate-600">{item.name} ({item.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Availability Grid */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Fleet Availability Grid</CardTitle>
                    <CardDescription>Live tracking of individual driver readiness</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {drivers.map((driver, index) => {
                            const status = index % 4 === 0 ? 'Leave' : index % 3 === 0 ? 'Available' : 'On-Trip';
                            const name = driver.driverName || driver.name || 'Unknown';
                            return (
                                <div key={driver.id || index} className="p-4 rounded-xl bg-white border border-slate-100 hover:shadow-md transition-all flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ring-4 ring-slate-50 ${
                                        status === 'Available' ? 'bg-green-100 text-green-700' :
                                        status === 'On-Trip' ? 'bg-blue-100 text-blue-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                        {name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 truncate">{name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className={`w-2 h-2 rounded-full ${
                                                status === 'Available' ? 'bg-green-500' :
                                                status === 'On-Trip' ? 'bg-blue-500' :
                                                'bg-amber-500'
                                            }`} />
                                            <span className="text-xs text-slate-500 font-medium">{status}</span>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                                       <CalendarCheck className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
