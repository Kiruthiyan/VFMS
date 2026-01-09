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
import { MoreHorizontal, Plus, Search, Filter, Wrench, Calendar, DollarSign } from "lucide-react";

// Mock Data
const maintenanceRecords = [
    {
        id: "M-501",
        vehicle: "Toyota Camry (ABC-1234)",
        type: "Oil Change",
        description: "Standard oil change and filter replacement",
        date: "2024-03-20",
        cost: "$85.00",
        status: "Scheduled",
        approver: "Admin",
    },
    {
        id: "M-502",
        vehicle: "Ford Transit (XYZ-5678)",
        type: "Brake Repair",
        description: "Brake pad replacement - Front",
        date: "2024-03-18",
        cost: "$250.00",
        status: "In Progress",
        approver: "Admin",
    },
    {
        id: "M-503",
        vehicle: "Isuzu NQR (TRK-5544)",
        type: "Tire Rotation",
        description: "Rotate and balance all tires",
        date: "2024-03-15",
        cost: "$120.00",
        status: "Completed",
        approver: "Admin",
    },
    {
        id: "M-504",
        vehicle: "Honda CR-V (LMN-9012)",
        type: "Engine Check",
        description: "Checking engine light - Diagnostic",
        date: "2024-03-22",
        cost: "$0.00",
        status: "Pending Approval",
        approver: "-",
    },
];

export default function MaintenancePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Maintenance</h1>
                    <p className="text-slate-500 mt-1">Track vehicle repairs, services and costs.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    <Plus className="mr-2 h-4 w-4" /> Request Service
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search records..."
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
                            <TableHead>Vehicle & Issue</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Cost</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {maintenanceRecords.map((record) => (
                            <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell className="font-mono font-medium text-slate-900">{record.id}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium text-slate-800">{record.vehicle}</span>
                                        <span className="text-xs text-slate-500 truncate max-w-[200px]">{record.description}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <Wrench className="h-3.5 w-3.5 text-slate-400" />
                                        {record.type}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {record.date}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium text-slate-900">{record.cost}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`
                                            ${record.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                            ${record.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                            ${record.status === 'Scheduled' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                            ${record.status === 'Pending Approval' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                        `}
                                    >
                                        {record.status}
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
                                            <DropdownMenuItem>Approve</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
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
