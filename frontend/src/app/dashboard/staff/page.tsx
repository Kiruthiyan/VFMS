"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Fuel, BarChart3, ArrowRight, PlusCircle, List } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StaffDashboardPage() {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome, Staff</h2>
                <p className="text-slate-500 font-medium mt-2">Fuel management and vehicle tracking overview.</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Add Fuel Record Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Link href="/fuel/entry" className="block group h-full">
                        <Card className="h-full border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <PlusCircle className="w-24 h-24 text-emerald-500" />
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
                                    <PlusCircle className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Add Fuel Record</CardTitle>
                                <CardDescription>Log a new fuel purchase for a vehicle.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-bold text-emerald-600 mt-4 group-hover:translate-x-1 transition-transform">
                                    Add Purchase <ArrowRight className="ml-2 w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Fuel Records List Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link href="/fuel" className="block group h-full">
                        <Card className="h-full border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <List className="w-24 h-24 text-blue-500" />
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                    <List className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Fuel Records</CardTitle>
                                <CardDescription>View and manage all fuel purchase logs.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-bold text-blue-600 mt-4 group-hover:translate-x-1 transition-transform">
                                    View Records <ArrowRight className="ml-2 w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Fuel Analytics Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Link href="/fuel/analytics" className="block group h-full">
                        <Card className="h-full border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BarChart3 className="w-24 h-24 text-amber-500" />
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                                    <BarChart3 className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Fuel Analytics</CardTitle>
                                <CardDescription>Monitor consumption trends and costs.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-bold text-amber-600 mt-4 group-hover:translate-x-1 transition-transform">
                                    View Analytics <ArrowRight className="ml-2 w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Vehicle Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link href="/fuel/summary" className="block group h-full">
                        <Card className="h-full border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Fuel className="w-24 h-24 text-purple-500" />
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                                    <Fuel className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Vehicle Summary</CardTitle>
                                <CardDescription>View fuel efficiency by vehicle.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-bold text-purple-600 mt-4 group-hover:translate-x-1 transition-transform">
                                    View Summary <ArrowRight className="ml-2 w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
