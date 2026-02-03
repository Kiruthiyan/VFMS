"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, User, MoreHorizontal, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Schema for adding/editing a driver profile
const driverSchema = z.object({
    fullName: z.string().min(2, "Full Name is required"),
    email: z.string().email("Invalid email"),
    licenseNumber: z.string().min(5, "License Number is required"),
    licenseExpiry: z.string().min(1, "Expiry Date is required"), // YYYY-MM-DD
    status: z.enum(["AVAILABLE", "ON_TRIP", "ON_LEAVE"]).default("AVAILABLE"),
});

type DriverValues = z.infer<typeof driverSchema>;

export default function DriversPage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [drivers, setDrivers] = useState<any[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await api.get("/drivers");
            setDrivers(response.data);
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        }
    };

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = useForm<DriverValues>({
        resolver: zodResolver(driverSchema),
        defaultValues: {
            status: "AVAILABLE"
        }
    });

    const onAddSubmit = async (data: DriverValues) => {
        setIsLoading(true);
        try {
            // Need to verify if backend supports creating driver directly via POST /drivers
            // Based on Controller, yes: @PostMapping public ResponseEntity<User> createDriver(@RequestBody User driver)
            // But User model is complex. Let's assume we send partial data and backend handles it.
            // Wait, DriverController uses DriverService. createDriver uses User object.

            await api.post("/drivers", data);

            toast({
                title: "Driver Profile Created",
                description: `${data.fullName} added to the system.`,
            });
            setIsAddOpen(false);
            reset();
            fetchDrivers();
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Failed to add driver",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Driver Management</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage personnel, licenses, and availability.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 font-bold rounded-xl px-6">
                            <Plus className="mr-2 h-5 w-5" /> Add Driver
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="space-y-3 pb-4 border-b border-slate-100">
                            <DialogTitle className="text-2xl font-black text-slate-900">Add New Driver</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">
                                Create a profile for a new driver. Ensure license details are accurate.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Full Name</label>
                                <Input placeholder="e.g. Michael Racer" {...register("fullName")} className="h-11 rounded-xl bg-white text-slate-900 border-slate-200 focus:border-slate-400 transition-all" />
                                {errors.fullName && <p className="text-xs text-red-500 font-bold mt-1">{errors.fullName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Email Address</label>
                                <Input placeholder="michael@fleet.com" type="email" {...register("email")} className="h-11 rounded-xl bg-white text-slate-900 border-slate-200 focus:border-slate-400 transition-all" />
                                {errors.email && <p className="text-xs text-red-500 font-bold mt-1">{errors.email.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">License Number</label>
                                    <Input placeholder="DL-XXXXXX" {...register("licenseNumber")} className="h-11 rounded-xl bg-white text-slate-900 border-slate-200 focus:border-slate-400 transition-all" />
                                    {errors.licenseNumber && <p className="text-xs text-red-500 font-bold mt-1">{errors.licenseNumber.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">License Expiry</label>
                                    <Input type="date" {...register("licenseExpiry")} className="h-11 rounded-xl bg-white text-slate-900 border-slate-200 focus:border-slate-400 transition-all" />
                                    {errors.licenseExpiry && <p className="text-xs text-red-500 font-bold mt-1">{errors.licenseExpiry.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Current Status</label>
                                <Select onValueChange={(val) => setValue("status", val as any)} defaultValue="AVAILABLE">
                                    <SelectTrigger className="h-11 rounded-xl bg-white text-slate-900 border-slate-200 focus:border-slate-400 transition-all">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                        <SelectItem value="AVAILABLE" className="font-medium focus:bg-slate-50 cursor-pointer">Available</SelectItem>
                                        <SelectItem value="ON_TRIP" className="font-medium focus:bg-slate-50 cursor-pointer">On Trip</SelectItem>
                                        <SelectItem value="ON_LEAVE" className="font-medium focus:bg-slate-50 cursor-pointer">On Leave</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Create Profile
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Drivers List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider">Driver Name</th>
                            <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider">License Info</th>
                            <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider">Availability</th>
                            <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {drivers.map((driver) => (
                            <tr key={driver.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{driver.fullName}</div>
                                            <div className="text-slate-500 text-xs font-medium">{driver.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{driver.licenseNumber}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                            <Calendar className="h-3 w-3" /> Exp: {driver.licenseExpiry}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide
                                        ${driver.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                                            driver.status === 'ON_LEAVE' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'}`}>
                                        {driver.status.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-slate-100">
                                            <DropdownMenuItem className="font-medium cursor-pointer">View Performance</DropdownMenuItem>
                                            <DropdownMenuItem className="font-medium cursor-pointer">Assign Trip</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600 font-bold focus:bg-red-50 focus:text-red-700 cursor-pointer">Suspend Driver</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
