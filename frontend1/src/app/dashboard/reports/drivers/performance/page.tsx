"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Trophy, 
    TrendingUp, 
    Star, 
    Target, 
    Award,
    Navigation,
    Clock,
    User
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, Area, Line
} from 'recharts';

export default function PerformanceAnalytics() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await reportService.getDriverPerformance();
            // Sort by safety score descending for ranking
            const sorted = [...result].sort((a, b) => (b.safetyScore || 0) - (a.safetyScore || 0));
            setDrivers(sorted);
        } catch (error) {
            console.error("Failed to load performance data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading performance analytics...</div>;

    const topPerformer = drivers[0];
    const avgTrips = drivers.length > 0 ? drivers.reduce((sum, d) => sum + (d.totalTrips || 0), 0) / drivers.length : 0;

    const chartData = drivers.map(d => ({
        name: d.driverName || d.name || 'Unknown',
        safety: d.safetyScore || 0,
        efficiency: d.onTimeDeliveryRate || 0,
        trips: d.totalTrips || 0
    }));

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Performance Analytics</h1>
                <p className="text-slate-500 mt-1">Detailed evaluation of driver safety, efficiency, and reliability</p>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-amber-100 text-sm font-medium">Monthly Champion</p>
                                <h3 className="text-2xl font-bold mt-1">{topPerformer?.driverName}</h3>
                            </div>
                            <Award className="w-8 h-8 opacity-20" />
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">
                                {topPerformer?.safetyScore}% Safety
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Fleet Avg Trips</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">{avgTrips.toFixed(0)}</h3>
                            </div>
                            <Navigation className="w-8 h-8 text-blue-500 opacity-20" />
                        </div>
                        <p className="mt-4 text-xs text-slate-400">Successful completions per driver</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">On-Time Rate</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">94.2%</h3>
                            </div>
                            <Clock className="w-8 h-8 text-green-500 opacity-20" />
                        </div>
                        <p className="mt-4 text-xs text-slate-400">Total delivery punctuality</p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Ranking Chart */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Driver Rankings</CardTitle>
                    <CardDescription>Comparative analysis of safety and efficiency scores</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Bar dataKey="safety" fill="#3b82f6" name="Safety Score %" radius={[4, 4, 0, 0]} barSize={40} />
                            <Line type="monotone" dataKey="efficiency" stroke="#10b981" name="Efficiency %" strokeWidth={3} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Detailed Leaderboard */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle>Performance Leaderboard</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Driver</th>
                                    <th className="px-6 py-4">Safety Score</th>
                                    <th className="px-6 py-4">Efficiency</th>
                                    <th className="px-6 py-4">Total Distance</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {drivers.map((driver, index) => (
                                    <tr key={driver.id || index} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-2 ring-white">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{driver.driverName || driver.name || 'Unknown'}</p>
                                                    <p className="text-xs text-slate-500">{driver.assignedVehicle || 'Unassigned'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-20 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${driver.safetyScore > 85 ? 'bg-green-500' : driver.safetyScore > 70 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                        style={{ width: `${driver.safetyScore}%` }}
                                                    />
                                                </div>
                                                <span className="font-medium">{driver.safetyScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{driver.onTimeDeliveryRate}%</td>
                                        <td className="px-6 py-4 text-slate-500">{driver.totalDistance} km</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-amber-500">
                                                <Star className="w-4 h-4 fill-current mr-1" />
                                                <span className="font-bold">{driver.feedbackRating}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={driver.safetyScore > 90 ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100 border-none'}>
                                                {driver.safetyScore > 95 ? 'Elite' : driver.safetyScore > 85 ? 'Strategic' : 'Standard'}
                                            </Badge>
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
