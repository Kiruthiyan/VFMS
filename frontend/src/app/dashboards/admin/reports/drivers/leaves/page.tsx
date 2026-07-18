"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Palmtree } from "lucide-react";
import * as dsmReports from "@/lib/api/dsm-reports";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'];

type LeaveRow = {
    id?: string | number;
    driverId?: string | number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    driverName?: string;
};

type DriverRow = {
    id?: string;
    driverId?: string;
    driverName?: string;
    name?: string;
};

export default function LeaveAnalytics() {
    const [leaves, setLeaves] = useState<LeaveRow[]>([]);
    const [drivers, setDrivers] = useState<DriverRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [lData, dData] = await Promise.all([
                dsmReports.getDriverLeaves(),
                dsmReports.getDriverPerformance()
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

    const tableData = leaves.map(l => {
        const driver = drivers.find(d => (d.id || d.driverId) === l.driverId);
        return {
            ...l,
            driverName: driver?.driverName || driver?.name || `Driver ${l.driverId}`,
        };
    });

    const approvedCount = leaves.filter(l => l.status === 'Approved').length;
    const pendingCount = leaves.filter(l => l.status === 'Pending').length;
    const sickCount = leaves.filter(l => l.type === 'Sick').length;

    const typeData = [
        { name: 'Sick', value: sickCount },
        { name: 'Annual', value: leaves.filter(l => l.type === 'Annual').length },
        { name: 'Emergency', value: leaves.filter(l => l.type === 'Emergency').length },
    ].filter(v => v.value > 0);

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Leave Impact Analysis</h1>
                <p className="text-slate-500 mt-1">Driver availability trends and workforce absence tracking</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                <Palmtree className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Leaves</p>
                                <h3 className="text-2xl font-black text-slate-900">{leaves.length}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Approved Leaves</p>
                                <h3 className="text-2xl font-black text-slate-900">{approvedCount}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-red-50 text-red-600">
                                <Stethoscope className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sick Leaves</p>
                                <h3 className="text-2xl font-black text-slate-900">{sickCount}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Leave Type Distribution</CardTitle>
                        <CardDescription>Breakdown of absence reasons</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {typeData.length > 0 ? (
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
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No leave data available</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Leave Status Summary</CardTitle>
                        <CardDescription>Current approval breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                            <span className="text-sm font-bold text-green-700">Approved</span>
                            <span className="text-2xl font-black text-green-700">{approvedCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                            <span className="text-sm font-bold text-amber-700">Pending</span>
                            <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <span className="text-sm font-bold text-slate-700">Total</span>
                            <span className="text-2xl font-black text-slate-700">{leaves.length}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle>Fleet Absence History</CardTitle>
                    <CardDescription>All driver leave records</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Driver Name</th>
                                    <th className="px-6 py-4">From Date</th>
                                    <th className="px-6 py-4">To Date</th>
                                    <th className="px-6 py-4">Leave Reason</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {tableData.length > 0 ? tableData.map((l, index) => (
                                    <tr key={l.id || index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{l.driverName}</td>
                                        <td className="px-6 py-4 text-slate-500">{l.startDate || 'N/A'}</td>
                                        <td className="px-6 py-4 text-slate-500">{l.endDate || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-700">{l.reason || l.type || 'Leave reason not provided'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                l.status === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' :
                                                l.status === 'Pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none' :
                                                'bg-slate-100 text-slate-700 border-none'
                                            }>
                                                {l.status || 'Unknown'}
                                            </Badge>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No leave records found</td>
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
