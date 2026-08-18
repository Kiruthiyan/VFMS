"use client";

import { Button } from "@/components/ui/button";

import Link from "next/link";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Stethoscope, Calendar, FileText,
    CheckCircle2, FileWarning } from "lucide-react";
import * as dsmReports from "@/lib/api/dsm-reports";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function DriverAnalyticsOverview() {
    const [drivers, setDrivers] = useState<Array<{ driverName?: string; name?: string; id?: string; driverId?: string; totalTrips?: number; totalDistance?: number; rating?: number; performanceRating?: number; feedbackRating?: number }>>([]);
    const [infractions, setInfractions] = useState<Array<{ severity?: string; status?: string; driverName?: string; name?: string; type?: string; id?: string | number; date?: string }>>([]);
    const [compliance, setCompliance] = useState<Array<{ complianceScore?: number; licenseExpiry?: string; driverId?: string; id?: string }>>([]);
    const [leaves, setLeaves] = useState<Array<{ status?: string; type?: string; reason?: string; driverId?: string | number; id?: string | number; startDate?: string; endDate?: string; driver?: { fullName?: string } }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [dData, iData, cData, lData] = await Promise.all([
                dsmReports.getDriverPerformance(),
                dsmReports.getDriverInfractions(),
                dsmReports.getDriverCompliance(),
                dsmReports.getDriverLeaves(),
            ]);
            setDrivers(dData);
            setInfractions(iData);
            setCompliance(cData);
            setLeaves(lData);
        } catch (error) {
            console.error("Failed to load driver analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading analytics...</div>;

    // --- KPI Calculations ---
    const expiringSoon = compliance.filter(c => {
        if (!c.licenseExpiry) return false;
        const expiry = new Date(c.licenseExpiry);
        const soon = new Date();
        soon.setMonth(soon.getMonth() + 1);
        return expiry < soon;
    }).length;
    const avgComplianceScore = compliance.length > 0
        ? Math.round(compliance.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / compliance.length)
        : 0;
    const pendingInfractions = infractions.filter(i => i.status === 'Pending').length;
    const resolvedCount = infractions.filter(i => i.status === 'Resolved').length;
    const resolutionRate = infractions.length > 0 ? Math.round((resolvedCount / infractions.length) * 100) : 0;

    const severityData = [
        { name: 'Low', value: infractions.filter(i => i.severity === 'Low').length },
        { name: 'Medium', value: infractions.filter(i => i.severity === 'Medium').length },
        { name: 'High', value: infractions.filter(i => i.severity === 'High').length },
    ].filter(v => v.value > 0);

    const leaveTableData = leaves.map(l => {
        const driver = drivers.find(d => (d.id || d.driverId) === l.driverId);
        return {
            ...l,
            driverName: l.driver?.fullName || driver?.driverName || driver?.name || `Driver ${l.driverId}`,
        };
    });

    const approvedLeaves = leaves.filter(l => l.status === 'Approved').length;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 p-8 bg-slate-50/50 min-h-screen">

            <div>
                <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900 -ml-4 mb-2">
                    <Link href="/dashboards/admin/reports">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Reports Dashboard
                    </Link>
                </Button>
            </div>


            {/* ===== PAGE HEADER ===== */}
            <PageHeader title="Driver Reports" description="Complete driver analytics — profiles, infractions, documents and leaves" />

            {/* ===== SECTION 2: PROFILE ===== */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">Driver Profiles</h2>
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle>Personnel Directory</CardTitle>
                        <CardDescription>All registered fleet drivers</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Driver Name</th>
                                        <th className="px-6 py-4">Driver ID</th>
                                        <th className="px-6 py-4">Total Trips</th>
                                        <th className="px-6 py-4">Total Distance</th>
                                        <th className="px-6 py-4">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {drivers.length > 0 ? drivers.map((driver, index) => {
                                        const name = driver.driverName || driver.name || 'Unknown';
                                        const driverId = driver.driverId || driver.id || 'N/A';
                                        const rating = driver.rating || driver.performanceRating || 0;
                                        return (
                                            <tr key={driverId || index} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                            {name.charAt(0)}
                                                        </div>
                                                        <p className="font-bold text-slate-900">{name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{driverId}</td>
                                                <td className="px-6 py-4 font-bold text-slate-700">{driver.totalTrips || 0}</td>
                                                <td className="px-6 py-4 text-slate-500">{(driver.totalDistance || 0).toLocaleString()} km</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                                        <span className="font-bold">{rating.toFixed(1)}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No driver profiles found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ===== SECTION 3: INFRACTIONS ===== */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">Infractions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Total Violations</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{infractions.length}</div>
                            <p className="text-xs text-slate-400 mt-1">All recorded infractions</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Pending Review</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-600">{pendingInfractions}</div>
                            <p className="text-xs text-slate-400 mt-1">Awaiting supervisor sign-off</p>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-slate-500 uppercase">Resolution Rate</CardTitle></CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{resolutionRate}%</div>
                            <p className="text-xs text-slate-400 mt-1">{resolvedCount} of {infractions.length} resolved</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Severity Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            {severityData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {severityData.map((entry, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400">No infraction data</div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm overflow-hidden">
                        <CardHeader><CardTitle className="text-lg">Violation Log</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                                        <tr>
                                            <th className="px-4 py-3">Driver</th>
                                            <th className="px-4 py-3">Type</th>
                                            <th className="px-4 py-3">Severity</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {infractions.length > 0 ? infractions.slice(0, 5).map((item, index) => (
                                            <tr key={item.id || index} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-semibold text-slate-900">{item.driverName || item.name || 'Unknown'}</td>
                                                <td className="px-6 py-4 text-slate-600">{item.type || 'Standard'}</td>
                                                <td className="px-4 py-3">
                                                    <Badge className={item.severity === 'High' ? 'bg-red-50 text-red-600' : item.severity === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}>
                                                        {item.severity || 'Unknown'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge className={item.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                                                        {item.status || '-'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No infractions found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ===== SECTION 4: DOCUMENTS ===== */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">Document Compliance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><FileText className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Total Drivers</p>
                                    <h3 className="text-2xl font-black text-slate-900">{drivers.length}</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">Drivers included in the compliance audit</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-green-50 text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Compliance Rate</p>
                                    <h3 className="text-2xl font-black text-slate-900">{avgComplianceScore}%</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">Average document compliance across all drivers</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-amber-50 text-amber-600"><FileWarning className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Expiring Soon</p>
                                    <h3 className="text-2xl font-black text-slate-900">{expiringSoon}</h3>
                                    <p className="text-[11px] text-slate-400 mt-1">Licenses ending within the next 30 days</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle>Driver Compliance Audit</CardTitle>
                        <CardDescription>Document compliance status for all drivers</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Driver Name</th>
                                        <th className="px-6 py-4">Driver ID</th>
                                        <th className="px-6 py-4">Compliance Score</th>
                                        <th className="px-6 py-4">License Expiry</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {drivers.length > 0 ? drivers.map((driver, index) => {
                                        const driverId = driver.id || driver.driverId;
                                        const c = compliance.find(comp => (comp.id || comp.driverId) === driverId);
                                        const name = driver.driverName || driver.name || 'Unknown';
                                        const score = c?.complianceScore || 0;
                                        const isCompliant = score >= 80;
                                        return (
                                            <tr key={driverId || index} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">{name.charAt(0)}</div>
                                                        <p className="font-bold text-slate-900">{name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{driverId || 'N/A'}</td>
                                                <td className="px-6 py-4 font-bold text-slate-700">{score}%</td>
                                                <td className="px-6 py-4 text-slate-500">{c?.licenseExpiry || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <Badge className={isCompliant ? 'bg-green-100 text-green-700 border-none font-bold' : 'bg-red-50 text-red-600 border-red-100 font-bold'}>
                                                        {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No driver data found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ===== SECTION 5: LEAVES ===== */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">Leave Records</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-amber-50 text-amber-600"><Calendar className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Total Leaves</p>
                                    <h3 className="text-2xl font-black text-slate-900">{leaves.length}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-green-50 text-green-600"><CheckCircle2 className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Approved</p>
                                    <h3 className="text-2xl font-black text-slate-900">{approvedLeaves}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-red-50 text-red-600"><Stethoscope className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">Sick Leaves</p>
                                    <h3 className="text-2xl font-black text-slate-900">{leaves.filter(l => l.type === 'Sick').length}</h3>
                                </div>
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
                            <table className="w-full min-w-[760px] text-sm text-left">
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
                                    {leaveTableData.length > 0 ? leaveTableData.map((l, index) => (
                                        <tr key={l.id || index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-900">{l.driverName}</td>
                                            <td className="px-6 py-4 text-slate-500">{l.startDate || 'N/A'}</td>
                                            <td className="px-6 py-4 text-slate-500">{l.endDate || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-slate-700">{l.reason || l.type || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={
                                                    l.status === 'Approved' ? 'bg-green-100 text-green-700 border-none' :
                                                    l.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-none' :
                                                    'bg-slate-100 text-slate-700 border-none'
                                                }>
                                                    {l.status || 'Unknown'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No leave records found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
