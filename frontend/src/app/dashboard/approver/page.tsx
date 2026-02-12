"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckSquare, Fuel, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ApproverDashboardPage() {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Approver Pending Items</h2>
                <p className="text-slate-500 font-medium mt-2">Review and approve requests.</p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Fuel Requests Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Link href="/fuel" className="block group">
                        <Card className="h-full border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 relative overflow-hidden bg-white">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Fuel className="w-24 h-24 text-slate-900" />
                            </div>
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                    <CheckSquare className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900">Fuel Log Approvals</CardTitle>
                                <CardDescription>Pending fuel logs requiring review.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-sm font-bold text-blue-600 mt-4 group-hover:translate-x-1 transition-transform">
                                    Review Logs <ArrowRight className="ml-2 w-4 h-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>

                {/* Placeholder for other approvals if any */}
            </div>
        </div>
    );
}
