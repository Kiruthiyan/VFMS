"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Fuel, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome, Administrator</h2>
                <p className="text-slate-500 font-medium mt-2">Overview of system status and quick actions.</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* User Management Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Link href="/admin/users" className="block group h-full">
                        <Card className="h-full border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Users className="w-24 h-24 text-slate-900" />
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                    <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">User Management</CardTitle>
                                <CardDescription>Manage system access, roles, and onboarding.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-bold text-blue-600 mt-4 group-hover:translate-x-1 transition-transform">
                                    Manage Users <ArrowRight className="ml-2 w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Fuel Management Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Link href="/fuel/analytics" className="block group h-full">
                        <Card className="h-full border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Fuel className="w-24 h-24 text-amber-500" />
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
                                    <Fuel className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Fuel Management</CardTitle>
                                <CardDescription>Monitor consumption, costs, and analytics.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-bold text-amber-600 mt-4 group-hover:translate-x-1 transition-transform">
                                    View Analytics <ArrowRight className="ml-2 w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* System Health / Placeholder */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="block cursor-default h-full"
                >
                    <Card className="h-full border-slate-200 shadow-sm bg-slate-50/50">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-slate-400" />
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-500">System Health</CardTitle>
                            <CardDescription>All systems operational. Version 1.0.0</CardDescription>
                        </CardHeader>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
