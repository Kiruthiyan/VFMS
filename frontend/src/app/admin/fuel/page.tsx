"use client";

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
import { MoreHorizontal, Plus, Search, Filter, Fuel, User, MapPin } from "lucide-react";

// Mock Data
const fuelLogs = [
    {
        id: "F-201",
        vehicle: "Toyota Camry (ABC-1234)",
        driver: "John Doe",
        date: "2024-03-21",
        liters: "45.5 L",
        cost: "$65.20",
        station: "Shell Station #42",
        status: "Verified",
    },
    {
        id: "F-202",
        vehicle: "Ford Transit (XYZ-5678)",
        driver: "Jane Smith",
        date: "2024-03-20",
        liters: "60.0 L",
        cost: "$88.50",
        station: "BP Connect",
        status: "Pending",
    },
    {
        id: "F-203",
        vehicle: "Isuzu NQR (TRK-5544)",
        driver: "Michael Brown",
        date: "2024-03-19",
        liters: "85.2 L",
        cost: "$125.80",
        station: "Chevron City",
        status: "Verified",
    },
    {
        id: "F-204",
        vehicle: "Toyota Hiace (VAN-3322)",
        driver: "Sarah Wilson",
        date: "2024-03-18",
        liters: "52.3 L",
        cost: "$74.10",
        station: "Texaco",
        status: "Rejected",
    },
];

export default function FuelLogsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fuel Logs</h1>
                    <p className="text-slate-500 mt-1">Monitor fuel consumption and expenses.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    <Plus className="mr-2 h-4 w-4" /> Add Fuel Log
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search logs..."
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
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Station</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fuelLogs.map((log) => (
                            <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-mono font-medium text-slate-900">{log.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Fuel className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="font-medium text-slate-800 text-sm truncate max-w-[150px]">{log.vehicle}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <User className="h-3.5 w-3.5" />
                                        {log.driver}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {log.station}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-900 font-medium">{log.liters}</TableCell>
                                <TableCell className="text-slate-900 font-bold">{log.cost}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`
                                            ${log.status === 'Verified' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                            ${log.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                            ${log.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                        `}
                                    >
                                        {log.status}
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
                                            <DropdownMenuItem>View receipt</DropdownMenuItem>
                                            <DropdownMenuItem>Edit log</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
