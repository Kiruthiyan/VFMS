"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileBarChart, PieChart, TrendingUp, BarChart3 } from "lucide-react";

export default function ReportsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
                    <p className="text-slate-500 mt-1">Deep dive into fleet performance and costs</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Calendar className="mr-2 h-4 w-4" /> Last 30 Days
                    </Button>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800">
                        <Download className="mr-2 h-4 w-4" /> Export All
                    </Button>
                </div>
            </div>

            {/* Main Stats Row */}
            <div className="grid gap-4 md:grid-cols-4">
                {[
                    { label: "Total Fuel Cost", value: "$12,450", change: "+4%", icon: TrendingUp, color: "text-red-600" },
                    { label: "Maintenance Spend", value: "$3,200", change: "-12%", icon: TrendingUp, color: "text-green-600" },
                    { label: "Total Distance", value: "45,200 km", change: "+8%", icon: TrendingUp, color: "text-blue-600" },
                    { label: "Avg. Efficiency", value: "8.5 km/L", change: "+1%", icon: TrendingUp, color: "text-green-600" },
                ].map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">{stat.label}</CardTitle>
                            <stat.icon className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                <span className={`${stat.color} font-medium`}>{stat.change}</span> vs last month
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 h-[400px]">
                    <CardHeader>
                        <CardTitle>Cost Analysis</CardTitle>
                        <CardDescription>Monthly breakdown of Fuel vs Maintenance</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[300px] bg-slate-50 rounded-xl m-4 border-dashed border-2 border-slate-200">
                        <div className="text-center text-slate-400">
                            <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>Chart Visualization Placeholder</p>
                            <p className="text-xs">(Requires Recharts or Chart.js integration)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 h-[400px]">
                    <CardHeader>
                        <CardTitle>Vehicle Status Distribution</CardTitle>
                        <CardDescription>Current fleet operational status</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[300px] bg-slate-50 rounded-xl m-4 border-dashed border-2 border-slate-200">
                        <div className="text-center text-slate-400">
                            <PieChart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>Pie Chart Placeholder</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Available Reports</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { title: "Vehicle Utilization", desc: "Usage hours vs idle time per vehicle." },
                        { title: "Driver Performance", desc: "Safety scores, violations, and trip ratings." },
                        { title: "Maintenance History", desc: "Detailed logs of all service records." },
                        { title: "Fuel Consumption", desc: "Liters per 100km analysis by model." },
                        { title: "Trip Logs", desc: "Complete history of all authorized trips." },
                        { title: "Cost per Mile", desc: "Financial breakdown of fleet efficiency." },
                    ].map((rep, i) => (
                        <Card key={i} className="hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                            <CardHeader>
                                <CardTitle className="text-base group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                    <FileBarChart className="h-4 w-4" /> {rep.title}
                                </CardTitle>
                                <CardDescription>{rep.desc}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Calendar(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
