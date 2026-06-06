"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    FileText, 
    FileWarning, 
    CheckCircle2, 
    Upload, 
    AlertCircle,
    Download,
    Eye,
    FolderKanban,
    AlertTriangle
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export default function DocumentTracking() {
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
            console.error("Failed to load document data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading document tracking...</div>;

    const statsData = [
        { label: 'License Copies', status: '88%', ok: true },
        { label: 'Insurance Proof', status: '94%', ok: true },
        { label: 'Medical Certs', status: '72%', ok: false },
        { label: 'Background Checks', status: '100%', ok: true },
    ];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Document Tracking</h1>
                    <p className="text-slate-500 mt-1">Audit verification of mandatory uploads and digital document compliance</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Bulk Upload
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        Remind missing docs
                    </button>
                </div>
            </div>

            {/* Compliance Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <div className="flex items-end justify-between mt-4">
                                <h3 className={`text-4xl font-black ${stat.ok ? 'text-slate-900' : 'text-red-600'}`}>
                                    {stat.status}
                                </h3>
                                <div className={`p-2 rounded-lg ${stat.ok ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {stat.ok ? <CheckCircle2 className="w-5 h-5" /> : <FileWarning className="w-5 h-5" />}
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
                                <div className={`h-full rounded-full ${stat.ok ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: stat.status }} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Missing Documents Alert Section */}
            <Card className="border-none shadow-sm bg-amber-50 border-l-4 border-amber-500 rounded-2xl">
                <CardContent className="py-4 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                    <div>
                        <p className="text-sm font-bold text-amber-900">Immediate Action Required</p>
                        <p className="text-xs text-amber-700">7 drivers have expired or missing Medical Certificates. This affects operational eligibility.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Document Status Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Detailed Audit Master List</CardTitle>
                        <CardDescription>Comprehensive tracking of all mandatory document categories</CardDescription>
                    </div>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <FolderKanban className="w-5 h-5 text-slate-500" />
                    </button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Driver Personnel</th>
                                    <th className="px-6 py-4">License Copy</th>
                                    <th className="px-6 py-4">Medical Cert</th>
                                    <th className="px-6 py-4">Ins. Proof</th>
                                    <th className="px-6 py-4">Gov. ID</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {drivers.map((driver, index) => {
                                    const driverId = driver.id || driver.driverId;
                                    const c = compliance.find(comp => (comp.id || comp.driverId) === driverId);
                                    const isGood = c ? (c.complianceScore || 0) > 80 : false;
                                    const name = driver.driverName || driver.name || 'Unknown';
                                    
                                    return (
                                        <tr key={driverId || index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                                        {name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase font-black">ID: {driverId || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-[10px] px-2 py-0.5">UPLOADED</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {index % 3 === 0 ? (
                                                     <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border border-red-100 font-bold text-[10px] px-2 py-0.5">MISSING</Badge>
                                                ) : (
                                                     <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-[10px] px-2 py-0.5">UPLOADED</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-[10px] px-2 py-0.5">UPLOADED</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold text-[10px] px-2 py-0.5">UPLOADED</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Documents">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Download ZIP">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
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
