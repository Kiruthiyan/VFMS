"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { reportService } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Star, Award, UserCheck, Navigation } from "lucide-react";

export default function PerformancePage() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

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

    if (loading) return <div className="p-8">Loading...</div>;

    const avgScore = drivers.reduce((sum, d) => sum + (d.rating || d.performanceRating || 0), 0) / (drivers.length || 1);
    const totalFleetDistance = drivers.reduce((sum, d) => sum + (d.totalDistance || 0), 0);
    const topPerformer = [...drivers].sort((a, b) => (b.rating || b.performanceRating || 0) - (a.rating || a.performanceRating || 0))[0];
    const topName = topPerformer?.driverName || topPerformer?.name || 'N/A';
    const topRating = topPerformer?.rating || topPerformer?.performanceRating || 0;

    const chartData = drivers.map(d => ({
        name: (d.driverName || d.name || 'Unknown').split(' ')[0],
        totalTrips: d.totalTrips || 0,
        performanceRating: d.rating || d.performanceRating || 0,
    }));

    const avgLabel = avgScore.toFixed(1) + " / 5.0";
    const distanceLabel = totalFleetDistance.toLocaleString() + " km";

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                    <Award className="w-8 h-8 text-indigo-500" />
                    Driver Analytics & Performance
                </h1>
                <p className="text-slate-500 mt-1">Personnel evaluation, safety metrics, and operational rankings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Avg Fleet Rating', value: avgLabel, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Active Personnel', value: String(drivers.length), icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Total Distance', value: distanceLabel, icon: Navigation, color: 'text-blue-500', bg: 'bg-blue-50' },
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
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Productivity vs. Quality</CardTitle>
                        <CardDescription>Trip completion volume against performance scores</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip cursor={{fill: 'transparent'}} />
                                    <Legend verticalAlign="top" align="right" iconType="circle" />
                                    <Bar dataKey="totalTrips" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} name="Total Trips" />
                                    <Bar dataKey="performanceRating" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={10} name="Rating" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-indigo-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Award className="w-32 h-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-white">Top Performer</CardTitle>
                        <CardDescription className="text-indigo-300">Highest rated operator</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {topPerformer ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-2xl font-black">
                                        {topName.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold">{topName}</h4>
                                        <p className="text-indigo-400 text-sm">ID: {topPerformer?.driverId || topPerformer?.id}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] uppercase font-bold text-indigo-400">Rating</p>
                                        <p className="text-xl font-black mt-1">{topRating.toFixed(1)} / 5.0</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] uppercase font-bold text-indigo-400">Trips</p>
                                        <p className="text-xl font-black mt-1">{topPerformer?.totalTrips || 0}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-indigo-300">No data available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg">Driver Efficiency Registry</CardTitle>
                    <CardDescription>Comprehensive metrics for all active personnel</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Driver Name</th>
                                    <th className="px-6 py-4">Total Trips</th>
                                    <th className="px-6 py-4">Distance (km)</th>
                                    <th className="px-6 py-4">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {drivers.length > 0 ? drivers.map((driver, index) => (
                                    <tr key={driver.driverId || driver.id || index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                    {(driver.driverName || driver.name || '?').charAt(0)}
                                                </div>
                                                <p className="font-bold text-slate-900">{driver.driverName || driver.name || 'Unknown'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700">{driver.totalTrips || 0}</td>
                                        <td className="px-6 py-4 font-medium text-slate-500">{(driver.totalDistance || 0).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                                                <span className="font-black text-slate-900">{(driver.rating || driver.performanceRating || 0).toFixed(1)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No driver data available</td>
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
