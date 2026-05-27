"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    FileCheck, 
    ShieldCheck, 
    AlertCircle, 
    Calendar, 
    HeartPulse,
    Car,
    FileText,
    History,
    CheckCircle2
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function ComplianceAnalytics() {
    const [compliance, setCompliance] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [cData, dData] = await Promise.all([
                reportService.getDriverCompliance(),
                reportService.getDriverPerformance()
            ]);
            setCompliance(cData);
            setDrivers(dData);
        } catch (error) {
            console.error("Failed to load compliance data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading compliance analytics...</div>;

    // Merge driver names for the table
    const tableData = compliance.map(c => {
        const driver = drivers.find(d => (d.id || d.driverId) === c.driverId);
        return {
            ...c,
            driverName: driver?.driverName || driver?.name || `Driver ${c.driverId}`
        };
    });

    // Compliance Score logic
    const avgScore = compliance.length > 0 ? compliance.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / compliance.length : 0;

    const expiringLicenses = compliance.filter(c => {
        if (!c.licenseExpiry) return false;
        const expiry = new Date(c.licenseExpiry);
        const alertRange = new Date();
        alertRange.setMonth(alertRange.getMonth() + 2);
        return expiry < alertRange;
    }).length;

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">License & Compliance</h1>
                    <p className="text-slate-500 mt-1">Audit tracking of driver credentials, medical certifications, and regulatory standards</p>
                </div>
                <Badge className="bg-slate-900 text-white px-4 py-1.5 rounded-full flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    Overall Fleet Compliance: {avgScore.toFixed(0)}%
                </Badge>
            </div>

            {/* Compliance High-level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm flex items-center p-6 gap-6">
                    <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase">Renewal Alerts</p>
                        <h3 className="text-2xl font-bold text-slate-900">{expiringLicenses} Items expiring soon</h3>
                    </div>
                </Card>

                <Card className="border-none shadow-sm flex items-center p-6 gap-6">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <History className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase">Training Cycles</p>
                        <h3 className="text-2xl font-bold text-slate-900">92% Up-to-date</h3>
                    </div>
                </Card>

                <Card className="border-none shadow-sm flex items-center p-6 gap-6">
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 uppercase">Audit Status</p>
                        <h3 className="text-2xl font-bold text-slate-900">Verified</h3>
                    </div>
                </Card>
            </div>

            {/* Compliance Summary Progress */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Compliance Score by Driver</CardTitle>
                    <CardDescription>Metric combining license, medical, and insurance validity periods</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tableData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="driverName" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="complianceScore" fill="#8b5cf6" name="Score %" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Detailed Document Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle>Document & Certification Registry</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Driver Name</th>
                                    <th className="px-6 py-4">License Expiry</th>
                                    <th className="px-6 py-4">Medical Certificate</th>
                                    <th className="px-6 py-4">Training Status</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {tableData.map((item, index) => {
                                    const isExpiring = item.licenseExpiry ? new Date(item.licenseExpiry) < new Date('2026-06-01') : false;
                                    return (
                                        <tr key={item.id || item.driverId || index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                        <Car className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-slate-900">{item.driverName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className={`w-4 h-4 ${isExpiring ? 'text-red-500' : 'text-slate-400'}`} />
                                                    <span className={isExpiring ? 'text-red-600 font-bold' : 'text-slate-600'}>{item.licenseExpiry}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <HeartPulse className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-600">{item.medicalExpiry}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={
                                                    item.trainingStatus === 'Up to Date' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' :
                                                    item.trainingStatus === 'Pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none' :
                                                    'bg-red-100 text-red-700 hover:bg-red-100 border-none'
                                                }>
                                                    {item.trainingStatus}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{item.complianceScore}%</td>
                                            <td className="px-6 py-4">
                                                <button className="text-blue-600 font-bold hover:underline py-1 flex items-center gap-1 group">
                                                    <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
