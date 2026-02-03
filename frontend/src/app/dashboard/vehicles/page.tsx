"use client";

import { useState } from "react";
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
import { Plus, Loader2, Car, MoreHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const vehicleSchema = z.object({
    licensePlate: z.string().min(2, "License plate is required"),
    model: z.string().min(2, "Model is required"),
    category: z.enum(["SEDAN", "SUV", "VAN", "TRUCK", "BUS"]),
    fuelType: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID"]),
    status: z.enum(["AVAILABLE", "MAINTENANCE", "RENTED", "ON_TRIP"]).default("AVAILABLE"),
});

type VehicleValues = z.infer<typeof vehicleSchema>;

export default function VehiclesPage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Mock data
    const [vehicles, setVehicles] = useState([
        { id: 1, licensePlate: "ABC-1234", model: "Toyota Camry", category: "SEDAN", fuelType: "HYBRID", status: "AVAILABLE" },
        { id: 2, licensePlate: "XYZ-9876", model: "Ford F-150", category: "TRUCK", fuelType: "DIESEL", status: "ON_TRIP" },
        { id: 3, licensePlate: "EV-001", model: "Tesla Model 3", category: "SEDAN", fuelType: "ELECTRIC", status: "MAINTENANCE" },
    ]);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = useForm<VehicleValues>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            status: "AVAILABLE"
        }
    });

    const onAddSubmit = async (data: VehicleValues) => {
        setIsLoading(true);
        try {
            // await api.post("/vehicles", data);

            // Mock Update
            setVehicles([...vehicles, { id: vehicles.length + 1, ...data }]);

            toast({
                title: "Vehicle Registered",
                description: `${data.model} (${data.licensePlate}) added successfully.`,
            });
            setIsAddOpen(false);
            reset();
        } catch (err: any) {
            toast({
                title: "Error",
                description: "Failed to add vehicle",
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
                    <h1 className="text-3xl font-bold text-slate-900">Vehicle Management</h1>
                    <p className="text-slate-500 mt-1">Register and track fleet assets</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20">
                            <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-white">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900">Register New Vehicle</DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Enter vehicle details to add to the fleet.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">License Plate</label>
                                    <Input placeholder="ABC-1234" {...register("licensePlate")} className="bg-white text-slate-900 border-slate-200 focus:border-slate-400" />
                                    {errors.licensePlate && <p className="text-xs text-red-500 font-medium">{errors.licensePlate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Model / Make</label>
                                    <Input placeholder="Toyota Camry" {...register("model")} className="bg-white text-slate-900 border-slate-200 focus:border-slate-400" />
                                    {errors.model && <p className="text-xs text-red-500 font-medium">{errors.model.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Category</label>
                                    <Select onValueChange={(val) => setValue("category", val as any)}>
                                        <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200">
                                            <SelectItem value="SEDAN" className="text-slate-700 hover:bg-slate-50 hover:text-slate-900">Sedan</SelectItem>
                                            <SelectItem value="SUV" className="text-slate-700 hover:bg-slate-50 hover:text-slate-900">SUV</SelectItem>
                                            <SelectItem value="VAN" className="text-slate-700 hover:bg-slate-50 hover:text-slate-900">Van</SelectItem>
                                            <SelectItem value="TRUCK" className="text-slate-700 hover:bg-slate-50 hover:text-slate-900">Truck</SelectItem>
                                            <SelectItem value="BUS" className="text-slate-700 hover:bg-slate-50 hover:text-slate-900">Bus</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Fuel Type</label>
                                    <Select onValueChange={(val) => setValue("fuelType", val as any)}>
                                        <SelectTrigger className="bg-white text-slate-900 border-slate-200">
                                            <SelectValue placeholder="Select Fuel" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200">
                                            <SelectItem value="PETROL" className="text-slate-700 hover:bg-slate-50 hover:text-slate-900">Petrol</SelectItem>
                                            <SelectItem value="DIESEL" className="text-slate-700 hover:bg-slate-50 hover:text-slate-900">Diesel</SelectItem>
                                            <SelectItem value="ELECTRIC" className="text-slate-700 hover:bg-slate-50 hover:text-slate-900">Electric</SelectItem>
                                            <SelectItem value="HYBRID" className="text-slate-700 hover:bg-slate-50 hover:text-slate-900">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.fuelType && <p className="text-xs text-red-500 font-medium">{errors.fuelType.message}</p>}
                                </div>
                            </div>

                            <DialogFooter className="mt-4">
                                <Button type="submit" disabled={isLoading} className="bg-slate-900 text-white hover:bg-slate-800">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Register Vehicle
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Vehicle List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-700">Vehicle Info</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Fuel</th>
                            <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {vehicles.map((vehicle) => (
                            <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                            <Car className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{vehicle.model}</div>
                                            <div className="text-slate-500 text-xs">{vehicle.licensePlate}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">
                                        {vehicle.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{vehicle.fuelType}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                                        ${vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                                            vehicle.status === 'MAINTENANCE' ? 'bg-red-100 text-red-700' :
                                                vehicle.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 
                                            ${vehicle.status === 'AVAILABLE' ? 'bg-green-600' :
                                                vehicle.status === 'MAINTENANCE' ? 'bg-red-600' :
                                                    vehicle.status === 'ON_TRIP' ? 'bg-blue-600' : 'bg-gray-600'}`}></span>
                                        {vehicle.status.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                            <DropdownMenuItem>View History</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
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
