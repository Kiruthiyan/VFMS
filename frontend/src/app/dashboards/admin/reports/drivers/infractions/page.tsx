"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as dsmReports from "@/lib/api/dsm-reports";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

type InfractionRow = {
    id?: number;
    driverName?: string;
    name?: string;
    type?: string;
    infractionType?: string;
    date?: string;
    incidentDate?: string;
    severity?: string;
    status?: string;
};

export default function InfractionAnalytics() {
    const [infractions, setInfractions] = useState<InfractionRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const result = await dsmReports.getDriverInfractions();
            setInfractions(result);
        } catch (error) {
            console.error("Failed to load infractions", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading infraction data...</div>;

    const pendingCount = infractions.filter(i => i.status === 'Pending').length;
    const resolvedCount = infractions.filter(i => i.status === 'Resolved').length;
    const resolutionRate = infractions.length > 0
        ? Math.round((resolvedCount / infractions.length) * 100)
        : 0;

    const severityData = [
        { name: 'Low', value: infractions.filter(i => i.severity === 'Low').length },
        { name: 'Medium', value: infractions.filter(i => i.severity === 'Medium').length },
        { name: 'High', value: infractions.filter(i => i.severity === 'High').length },
    ].filter(v => v.value > 0);

    const typeCounts = infractions.reduce<Record<string, number>>((acc, i) => {
        const key = i.type || i.infractionType || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    const barData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Infraction & Risk Analysis</h1>
                <p className="text-slate-500 mt-1">Monitoring violations, risk profiles, and driver compliance history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase">Total Violations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{infractions.length}</div>
                        <p className="text-xs text-slate-400 mt-1">All recorded infractions</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase">Pending Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
                        <p className="text-xs text-slate-400 mt-1">Items awaiting supervisor sign-off</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase">Resolution Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{resolutionRate}%</div>
                        <p className="text-xs text-slate-400 mt-1">{resolvedCount} of {infractions.length} resolved</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Incident Severity Distribution</CardTitle>
                        <CardDescription>Impact classification of recorded infractions</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {severityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={severityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No infraction data available</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Infraction Type Frequency</CardTitle>
                        <CardDescription>Most common violations across the fleet</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={120} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <div>
                        <CardTitle>Violation History Log</CardTitle>
                        <CardDescription>Detailed audit trail of all driver incidents</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Incident ID</th>
                                    <th className="px-6 py-4">Driver</th>
                                    <th className="px-6 py-4">Violation Type</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Severity</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {infractions.length > 0 ? infractions.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{item.id || 'N/A'}</td>
                                                <td className="px-6 py-4 font-semibold text-slate-900">{item.driverName || item.name || 'Unknown'}</td>
                                                <td className="px-6 py-4 text-slate-600">{item.type || item.infractionType || 'Standard'}</td>
                                                <td className="px-6 py-4 text-slate-500">{item.date || item.incidentDate || '-'}</td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                item.severity === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                                                item.severity === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                'bg-green-50 text-green-600 border-green-100'
                                            }>
                                                {item.severity || 'Unknown'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                item.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                item.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    item.status === 'Resolved' ? 'bg-green-600' : 'bg-amber-600'
                                                }`} />
                                                {item.status || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No infraction records found</td>
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
