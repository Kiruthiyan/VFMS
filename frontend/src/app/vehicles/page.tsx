"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    year: number;
    status: string;
    type: string;
    currentOdometer?: number;
    fuelLevel?: string;
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get("/vehicles");
            setVehicles(response.data || []);
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
            toast.error("Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch =
            v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "ALL" || v.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "AVAILABLE":
                return "bg-green-100 text-green-700 border-green-200";
            case "IN_USE":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "MAINTENANCE":
                return "bg-amber-100 text-amber-700 border-amber-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <ModuleLayout title="Vehicle Management">
            <div className="space-y-6">
                {/* Header with Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Total Vehicles</p>
                                    <p className="text-3xl font-black text-slate-900 mt-1">{vehicles.length}</p>
                                </div>
                                <Car className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Available</p>
                                    <p className="text-3xl font-black text-green-600 mt-1">
                                        {vehicles.filter(v => v.status === "AVAILABLE").length}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <div className="h-3 w-3 rounded-full bg-green-600"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">In Maintenance</p>
                                    <p className="text-3xl font-black text-amber-600 mt-1">
                                        {vehicles.filter(v => v.status === "MAINTENANCE").length}
                                    </p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                    <div className="h-3 w-3 rounded-full bg-amber-600"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Actions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Vehicles</CardTitle>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Vehicle
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by make, model, or license plate..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="AVAILABLE">Available</SelectItem>
                                    <SelectItem value="IN_USE">In Use</SelectItem>
                                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                            </div>
                        ) : filteredVehicles.length === 0 ? (
                            <div className="text-center py-12">
                                <Car className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No vehicles found</p>
                                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or add a new vehicle</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Vehicle</TableHead>
                                            <TableHead className="font-semibold">License Plate</TableHead>
                                            <TableHead className="font-semibold">Type</TableHead>
                                            <TableHead className="font-semibold">Year</TableHead>
                                            <TableHead className="font-semibold">Odometer</TableHead>
                                            <TableHead className="font-semibold">Fuel Level</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredVehicles.map((vehicle) => (
                                            <TableRow key={vehicle.id} className="hover:bg-slate-50">
                                                <TableCell className="font-medium">
                                                    {vehicle.make} {vehicle.model}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                                                        {vehicle.licensePlate}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{vehicle.type}</TableCell>
                                                <TableCell>{vehicle.year}</TableCell>
                                                <TableCell>
                                                    {vehicle.currentOdometer ? `${vehicle.currentOdometer.toLocaleString()} km` : 'N/A'}
                                                </TableCell>
                                                <TableCell>{vehicle.fuelLevel || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(vehicle.status)}>
                                                        {vehicle.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ModuleLayout>
    );
}
