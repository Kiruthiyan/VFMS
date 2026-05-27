"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { reportService } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
    Star, 
    Award, 
    AlertCircle, 
    ShieldCheck, 
    TrendingUp, 
    UserCheck,
    Navigation,
    Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PerformancePage() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await reportService.getDriverPerformance();
            setDrivers(result);
        } catch (error) {
            console.error("Failed to load driver performance data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Analyzing driver cohorts...</div>;

    // --- Analytics Processing ---
    const avgScore = drivers.reduce((sum, d) => sum + (d.performanceRating || 0), 0) / (drivers.length || 1);
    const totalFleetDistance = drivers.reduce((sum, d) => sum + (d.totalDistance || 0), 0);
    const topPerformer = [...drivers].sort((a, b) => b.performanceRating - a.performanceRating)[0];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Award className="w-8 h-8 text-indigo-500" />
                        Driver Analytics & Performance
                    </h1>
                    <p className="text-slate-500 mt-1">Personnel evaluation, safety metrics, and operational rankings</p>
                </div>
                <div className="flex gap-2">
                   <Badge className="bg-indigo-50 text-indigo-600 border-none px-4 py-1.5 rounded-full font-bold">
                        Fleet Safety Score: 94%
                   </Badge>
                </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Fleet Rating', value: `${avgScore.toFixed(1)} / 5.0`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Active Personnel', value: drivers.length, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Total Distance', value: `${totalFleetDistance.toLocaleString()} km`, icon: Navigation, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Compliance Rate', value: '98.2%', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-2">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Rating Distribution */}
                 <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Productivity vs. Quality</CardTitle>
                        <CardDescription>Mapping trip completion volume against weighted performance scores</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={drivers}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="totalTrips" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} name="Total Trips" />
                                <Bar dataKey="performanceRating" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={10} name="Rating (x10)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>

                 {/* Top Performer Card */}
                 <Card className="border-none shadow-sm bg-indigo-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Award className="w-32 h-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-white">Top Performer</CardTitle>
                        <CardDescription className="text-indigo-300">Highest rated operator this quarter</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-2xl font-black">
                                {topPerformer?.name?.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold">{topPerformer?.name}</h4>
                                <p className="text-indigo-400 text-sm">ID: {topPerformer?.id}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] uppercase font-bold text-indigo-400">Rating</p>
                                <p className="text-xl font-black mt-1">4.9 / 5.0</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[10px] uppercase font-bold text-indigo-400">Trips</p>
                                <p className="text-xl font-black mt-1">{topPerformer?.totalTrips}</p>
                            </div>
                        </div>
                        <button className="w-full py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-white/90 transition-all">
                            View Full Profile
                        </button>
                    </CardContent>
                 </Card>
            </div>

            {/* Driver Registry Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg">Driver Efficiency Registry</CardTitle>
                    <CardDescription>Comprehensive metrics audit for all active personnel</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Operator Identity</th>
                                    <th className="px-6 py-4">Total Trips</th>
                                    <th className="px-6 py-4">Mileage (km)</th>
                                    <th className="px-6 py-4">Safety Score</th>
                                    <th className="px-6 py-4">Infractions</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {drivers.map((driver) => (
                                    <tr key={driver.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                    {driver.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{driver.name}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold">L: {driver.licenseNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{driver.totalTrips}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{driver.totalDistance?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                                <span className="font-black text-slate-900">{driver.performanceRating?.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {driver.infractions > 0 ? (
                                                <Badge className="bg-red-50 text-red-600 border-none px-2 py-0.5">
                                                    {driver.infractions} Alerts
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-green-50 text-green-600 border-none px-2 py-0.5">
                                                    Clear
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2 h-2 rounded-full ${driver.licenseStatus === 'VALID' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-[10px] font-black uppercase text-slate-500">{driver.licenseStatus}</span>
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
