"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Calendar, Car, DollarSign, Clock, FileText, Search, 
    TrendingUp, PieChart as PieIcon, BarChart3, Users, 
    Building2, Briefcase, Heart, Ship
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

export default function RentalAnalyticsPage() {
    const [rentals, setRentals] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [rentalData, vehicleData] = await Promise.all([
                reportService.getRentalAnalytics(),
                reportService.getVehicles()
            ]);
            setRentals(rentalData);
            setVehicles(vehicleData);
        } catch (error) {
            console.error("Failed to load rental analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading analytics...</div>;

    // Calculations
    const totalExpenses = rentals.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const avgDailyRate = rentals.length > 0 ? rentals.reduce((sum, r) => sum + (r.costPerDay || 0), 0) / rentals.length : 0;
    const totalDays = rentals.reduce((sum, r) => sum + (r.days || 0), 0);
    const rentedVehicles = vehicles.filter(v => v.status === 'RENTED').length;
    const rentalUtilization = vehicles.length > 0 ? (rentedVehicles / vehicles.length) * 100 : 0;

    // Charts Data
    const spendingData = rentals.map(r => ({
        name: r.startDate,
        amount: r.totalCost
    })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    const typeData = Array.from(new Set(rentals.map(r => r.vehicleType))).map(type => ({
        type,
        total: rentals.filter(r => r.vehicleType === type).reduce((sum, r) => sum + r.totalCost, 0),
        count: rentals.filter(r => r.vehicleType === type).length
    }));

    const purposeCounts = rentals.reduce((acc: any, r) => {
        acc[r.purpose] = (acc[r.purpose] || 0) + 1;
        return acc;
    }, {});

    const purposeData = Object.entries(purposeCounts).map(([subject, A]) => ({
        subject,
        A: A as number,
        fullMark: rentals.length
    }));

    const getPurposeIcon = (purpose: string) => {
        switch (purpose) {
            case 'Staff Transport': return <Users className="w-4 h-4" />;
            case 'Client Visits': return <Briefcase className="w-4 h-4" />;
            case 'Logistics Support': return <Building2 className="w-4 h-4" />;
            case 'Wedding Event': return <Heart className="w-4 h-4" />;
            default: return <Ship className="w-4 h-4" />;
        }
    };

    const filteredRentals = rentals.filter(r => 
        (r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Rental Insights</h1>
                    <p className="text-slate-500 mt-1">Analyzing external vehicle costs, vendors, and utilization purposes</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search rentals..."
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium">Total Expense</p>
                                <h3 className="text-2xl font-bold mt-1">${totalExpenses.toLocaleString()}</h3>
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-indigo-100 text-xs">
                            <TrendingUp className="w-3 h-3" />
                            <span>8.2% from last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Avg. Daily Rate</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">${avgDailyRate.toFixed(2)}</h3>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <Clock className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-slate-400">Average cost per day per vehicle</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Rental Days</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">{totalDays} Days</h3>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-slate-400">Total external utilization time</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Fleet Rented</p>
                                <h3 className="text-2xl font-bold mt-1 text-slate-900">{rentalUtilization.toFixed(0)}%</h3>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <Car className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${rentalUtilization}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Spending Trajectory</CardTitle>
                        <CardDescription>Daily rental cost fluctuations</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={spendingData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Purpose Distribution</CardTitle>
                        <CardDescription>Primary reasons for renting external vehicles</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={purposeData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 10}} />
                                <Radar
                                    name="Purposes"
                                    dataKey="A"
                                    stroke="#ec4899"
                                    fill="#ec4899"
                                    fillOpacity={0.3}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Costs by Vehicle Type</CardTitle>
                        <CardDescription>Strategic spend allocation across categories</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} width={100} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="total" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(purposeCounts).map(([purpose, count]: [string, any], index) => (
                            <div key={purpose} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                                        {getPurposeIcon(purpose)}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{purpose}</span>
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-white rounded-full text-indigo-600 shadow-sm">{count}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-slate-50">
                    <CardTitle className="text-lg">Rental History Details</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Customer / Purpose</th>
                                    <th className="px-6 py-4 font-semibold">Vehicle Type</th>
                                    <th className="px-6 py-4 font-semibold">Duration</th>
                                    <th className="px-6 py-4 font-semibold">Vendor ID</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total Cost</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRentals.map((rental) => (
                                    <tr key={rental.id} className="bg-white hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{rental.customerName}</span>
                                                <span className="text-xs text-slate-500">{rental.purpose}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{rental.vehicleType}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{rental.days} days</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{rental.vendorId}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-slate-900">${rental.totalCost}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                rental.status === 'Active' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-3 py-1' :
                                                rental.status === 'Completed' ? 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-none px-3 py-1' :
                                                'bg-red-50 text-red-600 border-none px-3 py-1'
                                            }>
                                                {rental.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}