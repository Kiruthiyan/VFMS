"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    UserCheck, 
    UserX, 
    CheckCircle2, 
    XCircle, 
    Zap,
    Scale,
    ShieldCheck,
    Briefcase
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function EligibilityAnalytics() {
    const [readiness, setReadiness] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [rData, dData] = await Promise.all([
                reportService.getDriverReadiness(),
                reportService.getDriverPerformance()
            ]);
            setReadiness(rData);
            setDrivers(dData);
        } catch (error) {
            console.error("Failed to load readiness data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading eligibility analytics...</div>;

    // Merge driver names
    const tableData = readiness.map(r => {
        const driver = drivers.find(d => (d.id || d.driverId) === r.driverId);
        return {
            ...r,
            driverName: driver?.driverName || driver?.name || `Driver ${r.driverId}`
        };
    });

    const eligibleCount = readiness.filter(r => r.isEligible).length;
    const nonEligibleCount = readiness.length - eligibleCount;

    const pieData = [
        { name: 'Eligible', value: eligibleCount },
        { name: 'Ineligible / Pending', value: nonEligibleCount },
    ];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Eligibility & Readiness</h1>
                <p className="text-slate-500 mt-1">Strategic audit of driver mission-readiness and deployment eligibility</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats & Pie Chart */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm h-[320px]">
                        <CardHeader>
                            <CardTitle className="text-lg">Fleet Eligibility Status</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-slate-900 text-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-sm uppercase tracking-wider">Critical Readiness</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="text-4xl font-bold">{readiness.length > 0 ? ((eligibleCount / readiness.length) * 100).toFixed(0) : 0}%</div>
                                <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                                    <Zap className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Drivers cleared for immediate high-priority deployment</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Readiness List */}
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle>Driver Readiness Directory</CardTitle>
                        <CardDescription>Real-time qualification status and skill matrix</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Driver</th>
                                        <th className="px-6 py-4 text-center">Eligibility</th>
                                        <th className="px-6 py-4">Readiness Score</th>
                                        <th className="px-6 py-4">Primary Skills</th>
                                        <th className="px-6 py-4">Status/Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {tableData.map((item, index) => (
                                        <tr key={item.id || item.driverId || index} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                                        {(item.driverName || 'U')[0]}
                                                    </div>
                                                    <span className="font-semibold text-slate-900">{item.driverName || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.isEligible ? (
                                                    <div className="p-2 bg-green-50 text-green-600 rounded-full inline-block">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-red-50 text-red-600 rounded-full inline-block">
                                                        <XCircle className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-20">
                                                        <div 
                                                            className={`h-full rounded-full ${item.readinessScore > 80 ? 'bg-green-500' : item.readinessScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                            style={{ width: `${item.readinessScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-slate-700">{item.readinessScore}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {(item.skills || []).map((skill: string) => (
                                                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium ${item.isEligible ? 'text-slate-500' : 'text-red-600 font-bold'}`}>
                                                    {item.reason}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Compliance Matrix Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        <div>
                            <CardTitle className="text-base">Skill Compatibility Index</CardTitle>
                            <CardDescription>Driver matching with vehicle assignment requirements</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="space-y-2">
                           <div className="flex justify-between text-xs font-semibold">
                               <span className="text-slate-500">Heavy Vehicle Ready</span>
                               <span className="text-slate-900">75%</span>
                           </div>
                           <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                               <div className="bg-blue-500 h-full" style={{ width: '75%' }} />
                           </div>
                       </div>
                       <div className="space-y-2">
                           <div className="flex justify-between text-xs font-semibold">
                               <span className="text-slate-500">First Aid Certified</span>
                               <span className="text-slate-900">92%</span>
                           </div>
                           <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                               <div className="bg-green-500 h-full" style={{ width: '92%' }} />
                           </div>
                       </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <Briefcase className="w-5 h-5 text-amber-500" />
                        <div>
                            <CardTitle className="text-base">Operational Readiness</CardTitle>
                            <CardDescription>Fleet capacity for sudden mission spikes</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-slate-900">Optimal</p>
                            <p className="text-xs text-slate-500">Current fleet can handle 15% more load</p>
                        </div>
                        <Scale className="w-12 h-12 text-slate-200" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
