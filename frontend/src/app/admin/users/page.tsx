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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Plus, Search, Filter, Shield, Mail } from "lucide-react";

// Mock Data
const users = [
    {
        id: "U-1",
        name: "Admin User",
        email: "admin@fleetpro.com",
        role: "ADMIN",
        status: "Active",
        lastLogin: "2 mins ago",
        initials: "AU",
    },
    {
        id: "U-2",
        name: "Operations Manager",
        email: "manager@fleetpro.com",
        role: "MANAGER",
        status: "Active",
        lastLogin: "2 hours ago",
        initials: "OM",
    },
    {
        id: "U-3",
        name: "John Doe",
        email: "john.d@fleetpro.com",
        role: "DRIVER",
        status: "On Leave",
        lastLogin: "3 days ago",
        initials: "JD",
    },
    {
        id: "U-4",
        name: "Jane Smith",
        email: "jane.s@fleetpro.com",
        role: "DRIVER",
        status: "Active",
        lastLogin: "5 hours ago",
        initials: "JS",
    },
];

export default function UsersPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Users & Roles</h1>
                    <p className="text-slate-500 mt-1">Manage system access and user permissions.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search users..."
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
                            <TableHead className="w-[250px]">User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-slate-200">
                                            <AvatarFallback className="bg-blue-50 text-blue-700 font-medium text-xs">
                                                {user.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">{user.name}</span>
                                            <span className="text-xs text-slate-500">{user.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-3.5 w-3.5 text-slate-400" />
                                        <span className="font-medium text-sm text-slate-700">{user.role}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`
                                            ${user.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                            ${user.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                            ${user.status === 'Inactive' ? 'bg-slate-50 text-slate-600 border-slate-200' : ''}
                                        `}
                                    >
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">{user.lastLogin}</TableCell>
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
                                            <DropdownMenuItem>View profile</DropdownMenuItem>
                                            <DropdownMenuItem>Change role</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
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
