"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, FileWarning } from "lucide-react";
import * as dsmReports from "@/lib/api/dsm-reports";

export default function DocumentTracking() {
    const [compliance, setCompliance] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [cData, dData] = await Promise.all([
                dsmReports.getDriverCompliance(),
                dsmReports.getDriverPerformance()
            ]);
            setCompliance(cData);
            setDrivers(dData);
        } catch (error) {
            console.error("Failed to load document data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading document tracking...</div>;

    const compliantCount = compliance.filter(c => (c.complianceScore || 0) >= 80).length;
    const nonCompliantCount = compliance.length - compliantCount;
    const overallRate = compliance.length > 0
        ? Math.round((compliantCount / compliance.length) * 100)
        : 0;
    const expiringSoon = compliance.filter(c => {
        if (!c.licenseExpiry) return false;
        const expiry = new Date(c.licenseExpiry);
        const soon = new Date();
        soon.setMonth(soon.getMonth() + 1);
        return expiry < soon;
    }).length;

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <PageHeader title="Document Tracking" description="Audit verification of mandatory uploads and digital document compliance" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Drivers</p>
                                <h3 className="text-2xl font-black text-slate-900">{drivers.length}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compliance Rate</p>
                                <h3 className="text-2xl font-black text-slate-900">{overallRate}%</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                <FileWarning className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expiring Soon</p>
                                <h3 className="text-2xl font-black text-slate-900">{expiringSoon}</h3>
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
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                        {name.charAt(0)}
                                                    </div>
                                                    <p className="font-bold text-slate-900">{name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-400">{driverId || 'N/A'}</td>
                                            <td className="px-6 py-4 font-bold text-slate-700">{score}%</td>
                                            <td className="px-6 py-4 text-slate-500">{c?.licenseExpiry || '-'}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={isCompliant
                                                    ? 'bg-green-100 text-green-700 border-none font-bold'
                                                    : 'bg-red-50 text-red-600 border-red-100 font-bold'
                                                }>
                                                    {isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No driver data found</td>
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
