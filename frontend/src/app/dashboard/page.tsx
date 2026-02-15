"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
    Activity, 
    CreditCard, 
    DollarSign, 
    Users, 
    Wrench, 
    Car, 
    AlertTriangle,
    CheckCircle2,
    Clock,
    TrendingUp,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Mock Data ---
const stats = [
    {
        title: "Total Revenue",
        value: "$45,231.89",
        change: "+20.1% from last month",
        icon: DollarSign,
        trend: "up"
    },
    {
        title: "Active Rentals",
        value: "+2350",
        change: "+180.1% from last month",
        icon: Users,
        trend: "up"
    },
    {
        title: "Maintenance Pending",
        value: "12",
        change: "-5 from last week",
        icon: Wrench,
        trend: "down"
    },
    {
        title: "Active Vehicles",
        value: "573",
        change: "+201 since last hour",
        icon: Activity,
        trend: "up"
    }
];

const recentActivity = [
    {
        id: 1,
        user: "Sarah Connor",
        action: "Requested maintenance",
        target: "Toyota Camry (ABC-123)",
        time: "10 mins ago",
        type: "maintenance"
    },
    {
        id: 2,
        user: "John Wick",
        action: "Returned vehicle",
        target: "Ford Mustang (GT-500)",
        time: "25 mins ago",
        type: "rental"
    },
    {
        id: 3,
        user: "System",
        action: "Alert: Low Tire Pressure",
        target: "Van-004",
        time: "1 hour ago",
        type: "alert"
    },
    {
        id: 4,
        user: "Admin",
        action: "Approved Request #M-505",
        target: "Brake Repair",
        time: "2 hours ago",
        type: "approval"
    }
];

// --- Components ---

const StatCard = ({ stat }: { stat: any }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all"
    >
        <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 font-bold text-sm">{stat.title}</span>
            <div className="p-2 bg-slate-50 rounded-xl">
                <stat.icon className="w-5 h-5 text-slate-700" />
            </div>
        </div>
        <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
        <div className="flex items-center gap-1 text-xs font-bold">
            {stat.trend === 'up' ? (
                <span className="text-emerald-500 flex items-center"><ArrowUpRight className="w-3 h-3 mr-1"/> {stat.change}</span>
            ) : (
                <span className="text-rose-500 flex items-center"><ArrowDownRight className="w-3 h-3 mr-1"/> {stat.change}</span>
            )}
        </div>
    </motion.div>
);

const ActivityItem = ({ item }: { item: any }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer group">
        <div className={`
            mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2
            ${item.type === 'maintenance' ? 'bg-orange-50 border-orange-100 text-orange-600' : ''}
            ${item.type === 'rental' ? 'bg-blue-50 border-blue-100 text-blue-600' : ''}
            ${item.type === 'alert' ? 'bg-red-50 border-red-100 text-red-600' : ''}
            ${item.type === 'approval' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : ''}
        `}>
            {item.type === 'maintenance' && <Wrench className="w-4 h-4" />}
            {item.type === 'rental' && <Car className="w-4 h-4" />}
            {item.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
            {item.type === 'approval' && <CheckCircle2 className="w-4 h-4" />}
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">{item.user}</span>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.time}
                </span>
            </div>
            <p className="text-sm text-slate-600 leading-snug">
                {item.action} <span className="text-slate-400 mx-1">•</span> <span className="font-medium text-amber-600">{item.target}</span>
            </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <MoreHorizontal className="w-4 h-4" />
            </Button>
        </div>
    </div>
);

// --- Simple Chart Visual ---
const MockChart = () => (
    <div className="h-[200px] w-full flex items-end gap-2 mt-8 px-4">
        {[40, 65, 45, 80, 55, 70, 40, 60, 50, 75, 60, 90].map((h, i) => (
            <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="flex-1 bg-slate-900 rounded-t-lg opacity-80 hover:opacity-100 hover:bg-amber-400 transition-colors relative group cursor-pointer"
            >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {h}%
                </div>
            </motion.div>
        ))}
    </div>
);

export default function DashboardPage() {
    const [currentRole, setCurrentRole] = useState("admin");

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Top Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Overview</h2>
                   <p className="text-slate-500 font-medium">Welcome back, here's what's happening with your fleet.</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-3">View as:</span>
                    <Select value={currentRole} onValueChange={setCurrentRole}>
                        <SelectTrigger className="w-[140px] border-none bg-slate-50 font-bold focus:ring-0">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="approver">Approver</SelectItem>
                            <SelectItem value="driver">Driver</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <StatCard key={i} stat={stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-xl font-bold">Fleet Utilization</CardTitle>
                                <CardDescription>Daily vehicle usage stats</CardDescription>
                            </div>
                            <Tabs defaultValue="week" className="w-[200px]">
                                <TabsList className="grid w-full grid-cols-2 h-9">
                                    <TabsTrigger value="week" className="text-xs font-bold">Week</TabsTrigger>
                                    <TabsTrigger value="month" className="text-xs font-bold">Month</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent>
                            <MockChart />
                            <div className="flex justify-between mt-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-6">
                        <Card className="border-slate-100 shadow-sm rounded-3xl bg-slate-900 text-white p-6 relative overflow-hidden group hover:translate-y-[-4px] transition-transform">
                             <div className="absolute top-0 right-0 p-8 rotate-12 opacity-10 group-hover:scale-110 transition-transform">
                                <Car className="w-32 h-32" />
                             </div>
                             <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center mb-4">
                                    <Car className="w-6 h-6 text-slate-900" />
                                </div>
                                <h3 className="text-2xl font-black mb-1">Rent Vehicle</h3>
                                <p className="text-slate-400 text-sm font-medium mb-6">Book a vehicle for your next trip.</p>
                                <Button className="w-full bg-white text-slate-900 hover:bg-amber-50 font-bold">Book Now</Button>
                             </div>
                        </Card>

                         <Card className="border-slate-100 shadow-sm rounded-3xl bg-amber-400 text-slate-900 p-6 relative overflow-hidden group hover:translate-y-[-4px] transition-transform">
                             <div className="absolute top-0 right-0 p-8 rotate-12 opacity-10 group-hover:scale-110 transition-transform">
                                <Wrench className="w-32 h-32" />
                             </div>
                             <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
                                    <Wrench className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-black mb-1">Maintenance</h3>
                                <p className="text-slate-800 text-sm font-medium mb-6 opacity-80">Report an issue or schedule service.</p>
                                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold">Request Service</Button>
                             </div>
                        </Card>
                    </div>
                </div>

                {/* Sidebar / Activity Feed */}
                <div className="lg:col-span-1">
                    <Card className="border-slate-100 shadow-sm rounded-3xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                            <CardDescription>Latest updates from the fleet</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                           <div className="space-y-2">
                               {recentActivity.map(item => (
                                   <ActivityItem key={item.id} item={item} />
                               ))}
                           </div>
                        </CardContent>
                        <div className="p-6 border-t border-slate-50 mt-auto">
                            <Button variant="outline" className="w-full font-bold">View History</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
