"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileBarChart, PieChart, TrendingUp, BarChart3, Activity } from "lucide-react";
import Link from "next/link";

const reportCards = [
    {
        href: "/dashboards/admin/reports/maintenance",
        title: "Maintenance Costs",
        description: "Maintenance expenses and trends over time.",
        icon: Activity,
    },
    {
        href: "/dashboards/admin/reports/fuel",
        title: "Fuel Analysis",
        description: "Fuel consumption costs and efficiency metrics.",
        icon: TrendingUp,
    },
    {
        href: "/dashboards/admin/reports/utilization",
        title: "Vehicle Utilization",
        description: "Distance traveled and fuel efficiency per vehicle.",
        icon: PieChart,
    },
    {
        href: "/dashboards/admin/reports/performance",
        title: "Driver Performance",
        description: "Driver ratings, trip counts, and safety metrics.",
        icon: BarChart3,
    },
    {
        href: "/dashboards/admin/reports/rentals",
        title: "Rental Management",
        description: "Rental bookings, customer details, and revenue tracking.",
        icon: FileBarChart,
    },
    {
        href: "/dashboards/admin/reports/export",
        title: "Export Reports",
        description: "Download detailed reports in PDF or Excel formats.",
        icon: Download,
    },
];

export default function ReportsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8">
            <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground mt-1">Deep dive into fleet performance and costs</p>
            </div>

            <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <CardHeader className="vfms-card-header px-6 py-4 pl-8">
                    <CardTitle className="text-xl text-slate-950">Available Reports</CardTitle>
                    <CardDescription>Choose a reporting workspace for operational review and exports</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {reportCards.map(({ href, title, description, icon: Icon }) => (
                            <Link key={href} href={href} className="group block h-full">
                                <Card className="h-full cursor-pointer border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg">
                                    <CardHeader className="p-5">
                                        <div className="flex items-start gap-3">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-blue-950 shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div className="min-w-0">
                                                <CardTitle className="text-base font-bold text-slate-950">{title}</CardTitle>
                                                <CardDescription className="mt-1 leading-relaxed text-slate-600">
                                                    {description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
