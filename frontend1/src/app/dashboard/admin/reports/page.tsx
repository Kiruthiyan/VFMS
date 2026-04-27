"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileBarChart, PieChart, TrendingUp, BarChart3, Activity } from "lucide-react";
import { reportService, DashboardStats } from "@/services/reportService";
import { exportService } from "@/services/exportService";
import Link from "next/link";

export default function ReportsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
        // Feature: Real-time updates - poll every 30 seconds
        const intervalId = setInterval(loadStats, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const loadStats = async () => {
        try {
            const data = await reportService.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading stats...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8">
            <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground mt-1">Deep dive into fleet performance and costs</p>
            </div>

            {/* Main Stats Row */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Fuel Cost</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalFuelCost.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Spend</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.totalMaintenanceCost.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Distance</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalDistance.toFixed(0)} km</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Efficiency</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.avgEfficiency.toFixed(1)} km/L</div>
                    </CardContent>
                </Card>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Available Reports</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/dashboard/admin/reports/maintenance">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" /> Maintenance Costs
                                </CardTitle>
                                <CardDescription>Maintenance expenses and trends over time.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboard/admin/reports/fuel">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" /> Fuel Analysis
                                </CardTitle>
                                <CardDescription>Fuel consumption costs and efficiency metrics.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboard/admin/reports/utilization">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <PieChart className="h-4 w-4 text-primary" /> Vehicle Utilization
                                </CardTitle>
                                <CardDescription>Distance traveled and fuel efficiency per vehicle.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboard/admin/reports/performance">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-primary" /> Driver Performance
                                </CardTitle>
                                <CardDescription>Driver ratings, trip counts, and safety metrics.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboard/admin/reports/rentals">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileBarChart className="h-4 w-4 text-primary" /> Rental Management
                                </CardTitle>
                                <CardDescription>Rental bookings, customer details, and revenue tracking.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboard/admin/reports/export">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Download className="h-4 w-4 text-primary" /> Export Reports
                                </CardTitle>
                                <CardDescription>Download detailed reports in PDF or Excel formats.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
