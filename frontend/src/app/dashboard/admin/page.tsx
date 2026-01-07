"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Car,
    Users,
    Calendar,
    Wrench,
    TrendingUp,
    AlertTriangle,
    ArrowRight,
    Activity
} from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Overview</h1>
                <p className="text-slate-500 mt-2">Welcome back. Here's what's happening with your fleet today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Fleet</CardTitle>
                        <Car className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">124</div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                            <span className="text-green-600 font-semibold flex items-center mr-1">
                                <TrendingUp className="h-3 w-3 mr-1" /> +2
                            </span>
                            new this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Active Trips</CardTitle>
                        <Activity className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">38</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Currently on the road
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Maintenance</CardTitle>
                        <Wrench className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">5</div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                            <span className="text-red-500 font-semibold flex items-center mr-1">
                                <AlertTriangle className="h-3 w-3 mr-1" /> 2
                            </span>
                            urgent requests
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Users</CardTitle>
                        <Users className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">89</div>
                        <p className="text-xs text-slate-500 mt-1">
                            Drivers, Staff, Managers
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Section / Recent Activity Placeholder */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Trip Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">JD</div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Site Visit - Downtown CA</p>
                                            <p className="text-xs text-slate-500">John Doe • Oct 24, 2024</p>
                                        </div>
                                    </div>
                                    <div className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full">Pending</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="text-lg">System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="font-medium text-slate-600">Fleet Utilization</span>
                                    <span className="font-bold text-slate-900">78%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 w-[78%] rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="font-medium text-slate-600">Maintenance Budget</span>
                                    <span className="font-bold text-slate-900">45%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[45%] rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="font-medium text-slate-600">Fuel Efficiency</span>
                                    <span className="font-bold text-slate-900">92%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[92%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
