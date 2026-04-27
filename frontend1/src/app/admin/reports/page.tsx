"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBarChart, Download, Calendar, ArrowRight, BarChart3, PieChart, TrendingUp } from "lucide-react";

const reports = [
    {
        title: "Fleet Usage Summary",
        description: "Overview of vehicle utilization, total distance covered, and active hours.",
        icon: BarChart3,
        date: "Last 30 Days",
        type: "Analytics",
    },
    {
        title: "Cost Analysis",
        description: "Detailed breakdown of fuel, maintenance, and operational expenses.",
        icon: PieChart,
        date: "Current Month",
        type: "Financial",
    },
    {
        title: "Driver Performance",
        description: "Scorecards for drivers based on trip efficiency and safety ratings.",
        icon: TrendingUp,
        date: "Last Quarter",
        type: "Performance",
    },
    {
        title: "Maintenance Forecast",
        description: "Predicted maintenance requirements based on vehicle usage patterns.",
        icon: Calendar,
        date: "Next Quarter",
        type: "Planning",
    },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reports</h1>
                <p className="text-slate-500 mt-1">Generate and export analytics for your fleet.</p>
            </div>

            {/* Reports Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {reports.map((report, index) => (
                    <Card key={index} className="flex flex-col hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <report.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{report.type}</span>
                            </div>
                            <CardTitle className="mt-4 text-xl">{report.title}</CardTitle>
                            <CardDescription className="mt-2 text-slate-600 mb-4 h-10 line-clamp-2">
                                {report.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-center text-sm text-slate-500">
                                <Calendar className="mr-2 h-4 w-4" />
                                Period: {report.date}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-slate-50/50">
                            <Button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm">
                                <Download className="mr-2 h-4 w-4" /> Export PDF
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Recent Exports Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Exports</h2>
                <div className="bg-white border rounded-xl divide-y">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500">
                                    <FileBarChart className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Monthly Expense Report - March 2024</p>
                                    <p className="text-sm text-slate-500">Generated on Mar 31, 2024</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">
                                Download <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
