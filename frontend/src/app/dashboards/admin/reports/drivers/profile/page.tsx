"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import * as dsmReports from "@/lib/api/dsm-reports";

export default function ProfileAnalytics() {
    const [drivers, setDrivers] = useState<Array<{
        driverName?: string;
        name?: string;
        driverId?: string;
        id?: string;
        totalTrips?: number;
        totalDistance?: number;
        rating?: number;
        performanceRating?: number;
        status?: string;
    }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const result = await dsmReports.getDriverPerformance();
            setDrivers(result);
        } catch (error) {
            console.error("Failed to load profile data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading profile analytics...</div>;

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <PageHeader
                title="Driver Profile Analysis"
                description="Registered fleet personnel directory"
                actions={
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold text-slate-700">{drivers.length} Drivers</span>
                    </div>
                }
            />

            <Card className="border-none shadow-sm">
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
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {drivers.length > 0 ? drivers.map((driver, index) => {
                                    const name = driver.driverName || driver.name || 'Unknown';
                                    const driverId = driver.driverId || driver.id || 'N/A';
                                    const rating = driver.rating || driver.performanceRating || 0;
                                    const status = (driver.status || 'UNKNOWN').toUpperCase();
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
                                            <td className="px-6 py-4 font-bold text-slate-700">{rating.toFixed(1)} / 5.0</td>
                                            <td className="px-6 py-4">
                                                <Badge className={
                                                    status === 'APPROVED' || status === 'ACTIVE'
                                                        ? 'bg-green-50 text-green-600 border-none text-[10px] font-bold'
                                                        : status === 'PENDING'
                                                            ? 'bg-amber-50 text-amber-600 border-none text-[10px] font-bold'
                                                            : 'bg-slate-100 text-slate-700 border-none text-[10px] font-bold'
                                                }>
                                                    {status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No driver profiles found</td>
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
