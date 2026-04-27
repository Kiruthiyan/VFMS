"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { reportService } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
    Wrench, AlertTriangle, Clock, TrendingDown, TrendingUp, Filter,
    Calendar, CheckCircle2, Timer, DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#f59e0b', '#ef4444', '#3b82f6'];

export default function MaintenancePage() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await reportService.getMaintenanceAnalytics();
            setRecords(result);
        } catch (error) {
            console.error("Failed to load maintenance data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading analysis...</div>;

    // Calculate Stats
    const closedRecords = records.filter(r => r.status === 'CLOSED');
    const totalActualCost = closedRecords.reduce((sum, r) => sum + (r.actualCost || 0), 0);
    const totalEstimatedCost = closedRecords.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    const avgDowntime = closedRecords.reduce((sum, r) => sum + (r.downtimeHours || 0), 0) / (closedRecords.length || 1);
    const variance = totalActualCost - totalEstimatedCost;
    const variancePercent = totalEstimatedCost > 0 ? (variance / totalEstimatedCost) * 100 : 0;

    // Data for Cost Comparison (Actual vs Estimated)
    const costTrendData = closedRecords.slice(-6).map(r => ({
        date: r.completedDate,
        actual: r.actualCost,
        estimated: r.estimatedCost
    }));

    // Data for Maintenance Type Distribution
    const typeData = [
        { name: 'Routine', value: records.filter(r => r.maintenanceType === 'ROUTINE_SERVICE').length },
        { name: 'Breakdown', value: records.filter(r => r.maintenanceType === 'BREAKDOWN').length },
        { name: 'Accident', value: records.filter(r => r.maintenanceType === 'ACCIDENT_DAMAGE').length },
    ].filter(item => item.value > 0);

    // Data for Downtime Trend
    const downtimeData = records.filter(r => r.status === 'CLOSED').map(r => ({
        date: r.completedDate,
        hours: r.downtimeHours
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-8 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Maintenance Analytics</h1>
                    <p className="text-slate-500 mt-1">Deep dive into fleet maintenance costs and performance</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-md">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Actual Spend</CardTitle>
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">${totalActualCost.toLocaleString()}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                           <span className={variance >= 0 ? "text-red-500 flex items-center" : "text-green-500 flex items-center"}>
                               {variance >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                               {Math.abs(variancePercent).toFixed(1)}%
                           </span>
                           vs budget
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Avg. Downtime</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                            <Timer className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{avgDowntime.toFixed(1)} hrs</div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            per maintenance task
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Breakdowns</CardTitle>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600 group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {records.filter(r => r.maintenanceType === 'BREAKDOWN').length}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Requires immediate attention</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500">Compliance</CardTitle>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">92%</div>
                        <p className="text-xs text-slate-500 mt-1 text-green-600 font-medium">On scheduled service</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Cost Comparison</CardTitle>
                        <CardDescription>Estimated vs Actual costs for recent tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={costTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Bar dataKey="estimated" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Estimated" />
                                <Bar dataKey="actual" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Actual" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Maintenance Types</CardTitle>
                        <CardDescription>Composition of fleet maintenance work</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center">
                        <div className="flex-1 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {typeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Downtime Analysis</CardTitle>
                    <CardDescription>Vehicle out-of-service hours trend</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={downtimeData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" hide />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} dot={{ stroke: '#3b82f6', strokeWidth: 2, fill: '#fff', r: 4 }} activeDot={{ r: 6 }} name="Downtime Hours" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Maintenance Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto rounded-lg">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Vehicle</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold">requested</th>
                                    <th className="px-6 py-4 font-semibold">completed</th>
                                    <th className="px-6 py-4 font-semibold text-right">Cost (Actual)</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.slice(0, 5).map((record) => (
                                    <tr key={record.id} className="bg-white hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-slate-900">{record.licensePlate}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="font-normal border-slate-200">
                                                {record.maintenanceType.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">{record.requestedDate}</td>
                                        <td className="px-6 py-4">{record.completedDate || '-'}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                            ${(record.actualCost || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    record.status === 'CLOSED' ? 'bg-green-500' : 'bg-amber-500'
                                                }`} />
                                                <span className="text-xs font-medium uppercase">{record.status}</span>
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
    );
}
