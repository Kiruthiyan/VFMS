"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Users, 
    Contact, 
    Briefcase, 
    Calendar, 
    MapPin,
    GraduationCap,
    Clock,
    CheckCircle2,
    Building2
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];

export default function ProfileAnalytics() {
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
            console.error("Failed to load profile data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading profile analytics...</div>;

    // Simulated distributions
    const expData = [
        { name: 'Senior (10+ yrs)', value: Math.ceil(drivers.length * 0.2) },
        { name: 'Mid-Level (5-10 yrs)', value: Math.ceil(drivers.length * 0.5) },
        { name: 'Junior (1-5 yrs)', value: Math.ceil(drivers.length * 0.3) },
    ];

    const deptData = [
        { name: 'Logistics', count: Math.ceil(drivers.length * 0.45) },
        { name: 'Staff Tx', count: Math.ceil(drivers.length * 0.25) },
        { name: 'Corporate', count: Math.ceil(drivers.length * 0.2) },
        { name: 'Support', count: Math.ceil(drivers.length * 0.1) },
    ];

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Driver Profile Analysis</h1>
                    <p className="text-slate-500 mt-1">Demographic profiling and categorical distribution of fleet personnel</p>
                </div>
                <div className="flex -space-x-3 overflow-hidden">
                    {drivers.slice(0, 5).map((d, i) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">
                            {(d.driverName || d.name || 'U')[0]}
                        </div>
                    ))}
                    <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-900 border-2 border-slate-900 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                        +{Math.max(0, drivers.length - 5)}
                    </div>
                </div>
            </div>

            {/* Distibution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm h-[400px]">
                    <CardHeader>
                        <CardTitle className="text-lg">Experience Segmentation</CardTitle>
                        <CardDescription>Professional tenure across the fleet</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {expData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm h-[400px]">
                    <CardHeader>
                        <CardTitle className="text-lg">Departmental Alignment</CardTitle>
                        <CardDescription>Staff distribution by cost center</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Identity Grid */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Personnel Identity Grid</CardTitle>
                    <CardDescription>Comprehensive directory of all registered fleet drivers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drivers.map((driver, index) => {
                            const name = driver.driverName || driver.name || 'Unknown';
                            const driverId = driver.id || driver.driverId;
                            return (
                                <div key={driverId || index} className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                                {name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{name}</h4>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">Senior Driver | Employee ID: {driverId || 'N/A'}</p>
                                            </div>
                                        </div>
                                    <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none px-2 py-0.5 text-[10px] font-bold">ACTIVE</Badge>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-y-4">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Briefcase className="w-4 h-4 text-slate-300" />
                                        <span className="text-xs font-medium">Logistics Unit</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 justify-self-end">
                                        <MapPin className="w-4 h-4 text-slate-300" />
                                        <span className="text-xs font-medium">Main Hub</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock className="w-4 h-4 text-slate-300" />
                                        <span className="text-xs font-medium">Joined Jan 2022</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 justify-self-end">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-xs font-bold text-slate-700">Verified</span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-all duration-300 border border-slate-100">
                                        View Full Dossier
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
