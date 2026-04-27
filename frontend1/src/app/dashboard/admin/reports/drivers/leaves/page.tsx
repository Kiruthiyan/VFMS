"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Calendar, 
    Palmtree, 
    Stethoscope, 
    AlertCircle, 
    BarChart3,
    Users,
    Activity,
    Clock
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'];

export default function LeaveAnalytics() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [lData, dData] = await Promise.all([
                reportService.getDriverLeaves(),
                reportService.getDriverPerformance()
            ]);
            setLeaves(lData);
            setDrivers(dData);
        } catch (error) {
            console.error("Failed to load leave data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading leave analytics...</div>;

    // Merge driver names
    const tableData = leaves.map(l => {
        const driver = drivers.find(d => (d.id || d.driverId) === l.driverId);
        return {
            ...l,
            driverName: driver?.driverName || driver?.name || `Driver ${l.driverId}`
        };
    });

    // Leave Status distribution
    const typeData = [
        { name: 'Sick', value: leaves.filter(l => l.type === 'Sick').length },
        { name: 'Annual', value: leaves.filter(l => l.type === 'Annual').length },
        { name: 'Emergency', value: leaves.filter(l => l.type === 'Emergency').length },
    ].filter(v => v.value > 0);

    const trendData = [
        { week: 'W1', count: 2 }, { week: 'W2', count: 5 }, { week: 'W3', count: 3 },
        { week: 'W4', count: 8 }, { week: 'W5', count: 4 }, { week: 'W6', count: 6 }
    ];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Leave Impact Analysis</h1>
                <p className="text-slate-500 mt-1">Strategic monitoring of driver availability trends and workforce absence impact</p>
            </div>

            {/* Leave KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Leaves', value: leaves.length, icon: Palmtree, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Avg Monthly Abs', value: '4.2', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Sick Leave Rate', value: '15%', icon: Stethoscope, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Fleet Capability', value: '91%', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Leave Trend line */}
                <Card className="lg:col-span-2 border-none shadow-sm h-[380px]">
                    <CardHeader>
                        <CardTitle className="text-lg">Periodic Absence Volatility</CardTitle>
                        <CardDescription>Absence frequency tracked weekly to identify seasonal clusters</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} dot={{ stroke: '#ef4444', strokeWidth: 2, r: 4, fill: '#fff' }} name="Leave Incidents" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Type Pie Chart */}
                <Card className="border-none shadow-sm h-[380px]">
                    <CardHeader>
                        <CardTitle className="text-lg">Leave Type Distribution</CardTitle>
                        <CardDescription>Breakdown of absence reasons categorized by policy</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Leave List Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle>Fleet Absence History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Driver Name</th>
                                    <th className="px-6 py-4">From Date</th>
                                    <th className="px-6 py-4">To Date</th>
                                    <th className="px-6 py-4">Absence Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {tableData.map((l, index) => (
                                    <tr key={l.id || index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{l.driverName}</td>
                                        <td className="px-6 py-4 border-l border-slate-50">{l.startDate}</td>
                                        <td className="px-6 py-4">{l.endDate}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {l.type === 'Sick' ? <Stethoscope className="w-4 h-4 text-red-400" /> : <Calendar className="w-4 h-4 text-blue-400" />}
                                                <span className="font-medium text-slate-700">{l.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                l.status === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none'
                                            }>
                                                {l.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-slate-400 hover:text-slate-900">
                                                <AlertCircle className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
