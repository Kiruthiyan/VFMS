"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Send,
    CheckCircle2,
    Clock,
    Wrench,
    MessageSquare,
    TrendingUp,
} from "lucide-react";
import * as dsmReports from "@/lib/api/dsm-reports";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const STATUS_LABELS: Record<string, string> = {
    OPEN: 'Pending',
    ACKNOWLEDGED: 'Approved',
    IN_PROGRESS: 'Approved',
    RESOLVED: 'Completed',
};

export default function DriverServiceRequestsAnalytics() {
    const [requests, setRequests] = useState<dsmReports.DriverServiceRequestRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await dsmReports.getDriverServiceRequests();
            setRequests(result);
        } catch (error) {
            console.error("Failed to load driver service requests", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading requests analytics...</div>;

    const statusData = [
        { name: 'Completed', value: requests.filter((r) => r.status === 'RESOLVED').length },
        { name: 'Approved', value: requests.filter((r) => r.status === 'ACKNOWLEDGED' || r.status === 'IN_PROGRESS').length },
        { name: 'Pending', value: requests.filter((r) => r.status === 'OPEN').length },
    ].filter((s) => s.value > 0);

    const trendData = [
        { day: 'Mon', count: 0 }, { day: 'Tue', count: 0 }, { day: 'Wed', count: 0 },
        { day: 'Thu', count: 0 }, { day: 'Fri', count: 0 }, { day: 'Sat', count: 0 }, { day: 'Sun', count: 0 },
    ];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Driver Service Requests</h1>
                    <p className="text-slate-500 mt-1">Open maintenance and inspection requests submitted by drivers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Open', value: requests.length, trend: 'Current queue', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Pending', value: requests.filter((r) => r.status === 'OPEN').length, trend: 'Awaiting action', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'In Progress', value: requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ACKNOWLEDGED').length, trend: 'Being handled', icon: Wrench, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'High Urgency', value: requests.filter((r) => r.urgency === 'HIGH').length, trend: 'Needs attention', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
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
                <Card className="border-none shadow-sm h-[380px]">
                    <CardHeader>
                        <CardTitle className="text-lg">Request Status</CardTitle>
                        <CardDescription>Distribution of open driver service requests</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={5} dataKey="value">
                                    {statusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm h-[380px]">
                    <CardHeader>
                        <CardTitle className="text-lg">Weekly Volume</CardTitle>
                        <CardDescription>Placeholder trend until historical aggregation is added</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle>Service Request Log</CardTitle>
                    <CardDescription>Open driver maintenance and inspection requests</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Requester</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Urgency</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400">{req.id}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{req.requesterId ?? req.driverId ?? '—'}</td>
                                        <td className="px-6 py-4">{req.requestType.replace(/_/g, ' ')}</td>
                                        <td className="px-6 py-4">{req.urgency}</td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{req.description ?? '—'}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline">{STATUS_LABELS[req.status] ?? req.status}</Badge>
                                        </td>
                                    </tr>
                                ))}
                                {requests.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            No open driver service requests
                                        </td>
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
