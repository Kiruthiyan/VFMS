"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Send, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Building2,
    Calendar,
    MessageSquare,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function StaffRequestsAnalytics() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await reportService.getStaffRequests();
            setRequests(result);
        } catch (error) {
            console.error("Failed to load staff requests", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading requests analytics...</div>;

    // Analytics Transformations
    const statusData = [
        { name: 'Completed', value: requests.filter(r => r.status === 'Completed').length },
        { name: 'Approved', value: requests.filter(r => r.status === 'Approved').length },
        { name: 'Pending', value: requests.filter(r => r.status === 'Pending').length },
        { name: 'Rejected', value: requests.filter(r => r.status === 'Rejected').length },
    ].filter(s => s.value > 0);

    const deptCounts = requests.reduce((acc: any, r) => {
        acc[r.department] = (acc[r.department] || 0) + 1;
        return acc;
    }, {});
    const deptData = Object.entries(deptCounts).map(([name, count]) => ({ name, count }));

    const trendData = [
        { day: 'Mon', count: 12 }, { day: 'Tue', count: 18 }, { day: 'Wed', count: 15 },
        { day: 'Thu', count: 24 }, { day: 'Fri', count: 32 }, { day: 'Sat', count: 8 }, { day: 'Sun', count: 5 }
    ];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Staff Requests Analytics</h1>
                    <p className="text-slate-500 mt-1">Operational tracking of inter-departmental transport service requests</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                        View Queue
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 font-bold">
                        <Send className="w-4 h-4" />
                        New Service Request
                    </button>
                </div>
            </div>

            {/* Request KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Requests', value: requests.length, trend: '+14% wk/wk', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending Approval', value: requests.filter(r => r.status === 'Pending').length, trend: 'Awaiting action', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Completion Rate', value: '92.4%', trend: 'Goal: 95%', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Avg Wait Time', value: '45m', trend: '-5m improvement', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stat.value}</h3>
                                    <p className={`text-[10px] font-bold mt-2 ${stat.color}`}>{stat.trend}</p>
                                </div>
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Donut */}
                <Card className="border-none shadow-sm h-[380px]">
                    <CardHeader>
                        <CardTitle className="text-lg">Service Fulfillment Status</CardTitle>
                        <CardDescription>Current stage distribution of all active requests</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Request Area Trend */}
                <Card className="border-none shadow-sm h-[380px]">
                    <CardHeader>
                        <CardTitle className="text-lg">Daily Request Velocity</CardTitle>
                        <CardDescription>Chronological volume of transport requests over the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Request Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Transport Request Log</CardTitle>
                        <CardDescription>Detailed audit of inter-office transport activity</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Request ID</th>
                                    <th className="px-6 py-4">Requestor</th>
                                    <th className="px-6 py-4">Department</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Purpose</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {requests.map((req, index) => (
                                    <tr key={req.id || index} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{req.id || 'N/A'}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{req.staffName || 'Unknown'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Building2 className="w-3 h-3 text-slate-300" />
                                                {req.department || 'General'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{req.requestDate || '-'}</td>
                                        <td className="px-6 py-4 font-medium text-slate-600">{req.purpose || 'Transport'}</td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                req.status === 'Completed' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' :
                                                req.status === 'Approved' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-none' :
                                                req.status === 'Pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none' :
                                                'bg-red-100 text-red-700 hover:bg-red-100 border-none'
                                            }>
                                                {req.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-1 px-3 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 hover:bg-slate-900 hover:text-white transition-all">
                                                DETAILS
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
