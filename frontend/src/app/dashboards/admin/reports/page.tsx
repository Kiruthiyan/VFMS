"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileBarChart, PieChart, TrendingUp, BarChart3, Activity } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8">
            <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground mt-1">Deep dive into fleet performance and costs</p>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Available Reports</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/dashboards/admin/reports/maintenance">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" /> Maintenance Costs
                                </CardTitle>
                                <CardDescription>Maintenance expenses and trends over time.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboards/admin/reports/fuel">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" /> Fuel Analysis
                                </CardTitle>
                                <CardDescription>Fuel consumption costs and efficiency metrics.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboards/admin/reports/utilization">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <PieChart className="h-4 w-4 text-primary" /> Vehicle Utilization
                                </CardTitle>
                                <CardDescription>Distance traveled and fuel efficiency per vehicle.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboards/admin/reports/performance">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-primary" /> Driver Performance
                                </CardTitle>
                                <CardDescription>Driver ratings, trip counts, and safety metrics.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboards/admin/reports/rentals">
                        <Card className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group h-full">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileBarChart className="h-4 w-4 text-primary" /> Rental Management
                                </CardTitle>
                                <CardDescription>Rental bookings, customer details, and revenue tracking.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href="/dashboards/admin/reports/export">
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
