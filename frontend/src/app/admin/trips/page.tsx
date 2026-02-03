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
import { MoreHorizontal, Plus, Search, Filter, MapPin, Calendar, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Trip {
    id: number;
    startLocation: string;
    endLocation: string;
    startTime: string;
    endTime: string;
    status: string;
    driver: {
        name: string;
    };
    vehicle: {
        licensePlate: string;
        make: string;
        model: string;
    };
    distance: string;
}

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await api.get("/trips");
            setTrips(response.data);
        } catch (error) {
            console.error("Failed to fetch trips", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trips</h1>
                    <p className="text-slate-500 mt-1">Monitor active and history of vehicle trips.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    <Plus className="mr-2 h-4 w-4" /> Schedule Trip
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search trips by ID, driver or vehicle..."
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
                            <TableHead className="w-[100px]">Trip ID</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Assignments</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin text-slate-400" />
                                        <span className="text-slate-500">Loading trips...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : trips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No trips found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            trips.map((trip) => (
                                <TableRow key={trip.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-mono font-medium text-slate-900">{trip.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 max-w-[200px]">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                                <MapPin className="h-3 w-3 text-red-500" />
                                                <span className="truncate">{trip.startLocation}</span>
                                            </div>
                                            <div className="pl-1.5 ml-1 border-l text-xs text-slate-400 py-0.5">
                                                <div className="ml-1 flex items-center gap-1">
                                                    <ArrowRight className="h-3 w-3" /> {trip.distance}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                                <MapPin className="h-3 w-3 text-green-500" />
                                                <span className="truncate">{trip.endLocation}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-slate-800">
                                                {trip.driver ? `${trip.driver.name}` : 'Unassigned'}
                                            </span>
                                            <span className="text-xs text-slate-500 text-nowrap">
                                                {trip.vehicle ? `${trip.vehicle.make} ${trip.vehicle.model}` : 'Unassigned'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                <span>{trip.startTime}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                ${trip.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                ${trip.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' : ''}
                                                ${trip.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                            `}
                                        >
                                            {trip.status}
                                        </Badge>
                                    </TableCell>
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
                                                <DropdownMenuItem>Track live</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Cancel trip</DropdownMenuItem>
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
