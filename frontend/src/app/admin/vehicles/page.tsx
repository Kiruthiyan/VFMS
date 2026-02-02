"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, Filter, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    type: string;
    status: string;
    fuelLevel: string;
    lastServiceDate: string;
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get("/vehicles");
            setVehicles(response.data);
        } catch (error) {
            console.error("Failed to fetch vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vehicles</h1>
                    <p className="text-slate-500 mt-1">Manage your fleet vehicles and their status.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    <Plus className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search vehicles..."
                        className="pl-9 border-none bg-transparent focus-visible:ring-0"
                    />
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <Button variant="ghost" size="sm" className="text-slate-600">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[100px]">Reg. No</TableHead>
                            <TableHead>Vehicle Info</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Fuel Level</TableHead>
                            <TableHead>Last Service</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin text-slate-400" />
                                        <span className="text-slate-500">Loading vehicles...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : vehicles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                    No vehicles found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            vehicles.map((vehicle) => (
                                <TableRow key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-medium text-slate-900">{vehicle.licensePlate}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">{vehicle.make} {vehicle.model}</span>
                                            <span className="text-xs text-slate-500">ID: {vehicle.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{vehicle.type}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                ${vehicle.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                ${vehicle.status === 'IN_USE' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                ${vehicle.status === 'MAINTENANCE' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                            `}
                                        >
                                            {vehicle.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${parseInt(vehicle.fuelLevel || '0') > 20 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                    style={{ width: vehicle.fuelLevel || '0%' }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-600">{vehicle.fuelLevel}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{vehicle.lastServiceDate}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View details</DropdownMenuItem>
                                                <DropdownMenuItem>Edit vehicle</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Delete vehicle</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
