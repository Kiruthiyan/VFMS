"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Users, 
    UserCheck, 
    AlertTriangle, 
    Clock, 
    ShieldAlert, 
    Calendar,
    BarChart3,
    Trophy,
    FileCheck,
    TrendingUp
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import Link from "next/link";

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function DriverAnalyticsOverview() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [infractions, setInfractions] = useState<any[]>([]);
    const [compliance, setCompliance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [dData, iData, cData] = await Promise.all([
                reportService.getDriverPerformance(),
                reportService.getDriverInfractions(),
                reportService.getDriverCompliance()
            ]);
            setDrivers(dData);
            setInfractions(iData);
            setCompliance(cData);
        } catch (error) {
            console.error("Failed to load driver analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading analytics...</div>;

    // KPI Calculations
    const totalDrivers = drivers.length;
    const highRiskDrivers = drivers.filter(d => d.safetyScore < 80).length;
    const criticalViolations = infractions.filter(i => i.severity === 'High' && i.status === 'Pending').length;
    const expiringSoon = compliance.filter(c => {
        const expiry = new Date(c.licenseExpiry);
        const soon = new Date();
        soon.setMonth(soon.getMonth() + 1);
        return expiry < soon;
    }).length;

    // Performance Stats
    const avgScore = totalDrivers > 0 
        ? drivers.reduce((sum, d) => sum + (d.safetyScore || 0), 0) / totalDrivers 
        : 0;

    // Chart Data
    const performanceData = drivers.slice(0, 5).map(d => ({
        name: (d.driverName || d.name || 'Unknown').split(' ')[0],
        score: d.safetyScore || 0,
        rating: (d.feedbackRating || 0) * 20 // scale to 100
    }));

    const statusDist = [
        { name: 'Active', value: drivers.length }, // Mocking for now
        { name: 'On Trip', value: Math.floor(drivers.length * 0.6) },
        { name: 'Leave', value: Math.floor(drivers.length * 0.1) }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-8 bg-slate-50/50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Driver Analytics Dashboard</h1>
                    <p className="text-slate-500 mt-1">Holistic view of fleet operations and driver performance metrics</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </button>
                    <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-md transition-all">
                        Export Full Report
                    </button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm group hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Drivers</CardTitle>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{totalDrivers}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
                            <TrendingUp className="w-3 h-3" />
                            <span>+2 new this month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm group hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Average Safety</CardTitle>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
                            <Trophy className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{avgScore.toFixed(1)}%</div>
                        <p className="text-xs text-slate-400 mt-1">Fleet wide safety score</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm group hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">High Risk</CardTitle>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:scale-110 transition-transform">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{highRiskDrivers}</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{criticalViolations} critical violations</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm group hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Doc Compliance</CardTitle>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                            <FileCheck className="w-5 h-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">88%</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{expiringSoon} licenses expiring</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links Section */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-3">
                {[
                    { label: 'Performance', href: '/reports/drivers/performance' },
                    { label: 'Infractions', href: '/reports/drivers/infractions' },
                    { label: 'Availability', href: '/reports/drivers/availability' },
                    { label: 'Compliance', href: '/reports/drivers/compliance' },
                    { label: 'Eligibility', href: '/reports/drivers/eligibility' },
                    { label: 'Profile', href: '/reports/drivers/profile' },
                    { label: 'Requests', href: '/reports/drivers/requests' },
                    { label: 'Leaves', href: '/reports/drivers/leaves' },
                    { label: 'Documents', href: '/reports/drivers/documents' },
                ].map((link) => (
                    <Link 
                        key={link.href}
                        href={`/dashboard/admin${link.href}`}
                        className="px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all text-center shadow-sm"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Top Driver Performance</CardTitle>
                        <CardDescription>Safety score vs Feedback rating</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="top" align="right" iconType="circle" />
                                <Bar dataKey="score" fill="#3b82f6" name="Safety Score" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="rating" fill="#10b981" name="Rating Index" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Fleet Status Availability</CardTitle>
                        <CardDescription>Real-time driver readiness distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDist}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section: Critical Alerts & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Staff Request Volume</CardTitle>
                        <CardDescription>Weekly trend of transport requests</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                                { name: 'Mon', req: 12 }, { name: 'Tue', req: 19 }, { name: 'Wed', req: 15 },
                                { name: 'Thu', req: 22 }, { name: 'Fri', req: 30 }, { name: 'Sat', req: 8 }, { name: 'Sun', req: 4 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip />
                                <Line type="monotone" dataKey="req" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Critical Notifications</CardTitle>
                        <CardDescription className="text-slate-400">Items requiring immediate action</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg flex-shrink-0">
                                <ShieldAlert className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Vijay Singh - High Risk</p>
                                <p className="text-xs text-slate-400">Multiple speeding violations this week</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg flex-shrink-0">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Suresh Patel - Expiry</p>
                                <p className="text-xs text-slate-400">Medical cert expires in 3 days</p>
                            </div>
                        </div>
                        <div className="pt-2">
                            <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">
                                View Action Center
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
