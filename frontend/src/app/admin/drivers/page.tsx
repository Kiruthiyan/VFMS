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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Plus, Search, Filter, Phone, Mail, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    status: string;
    joinedDate: string;
    avatarUrl: string;
}

const getInitials = (name: string) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
};

// ... inside return ...

                                            <Avatar className="h-9 w-9 border border-slate-200">
                                                <AvatarImage src={driver.avatarUrl} alt={driver.name} />
                                                <AvatarFallback className="bg-blue-50 text-blue-700 font-medium">
                                                    {getInitials(driver.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-800">{driver.name}</span>
                                                <span className="text-xs text-slate-500">{driver.email}</span>
                                            </div>
                                        </div >
                                    </TableCell >
                                    <TableCell>
                                        <div className="font-mono text-sm text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit">
                                            {driver.licenseNumber || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="h-3.5 w-3.5" />
                                            <span className="text-sm">{driver.phone || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                                                ${driver.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                                                ${driver.status === 'ON_TRIP' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                ${driver.status === 'INACTIVE' ? 'bg-slate-50 text-slate-600 border-slate-200' : ''}
                                            `}
                                        >
                                            {driver.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-600">{driver.joinedDate}</TableCell>
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
                                                <DropdownMenuItem>Edit driver</DropdownMenuItem>
                                                <DropdownMenuItem>Assign vehicle</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow >
                            ))
                        )}
                    </TableBody >
                </Table >
            </div >
        </div >
    );
}
