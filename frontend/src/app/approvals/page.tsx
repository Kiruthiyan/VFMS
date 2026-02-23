"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckSquare, XSquare, Clock, Loader2, FileText } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Approval {
    id: number;
    type: string;
    requestedBy: string;
    requestDate: string;
    status: string;
    description: string;
}

export default function ApprovalsPage() {
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // No mock data — starts empty for real database verification
        setLoading(false);
    }, []);


    const handleApprove = (id: number) => {
        toast.success("Request approved successfully");
        setApprovals(prev => prev.map(a =>
            a.id === id ? { ...a, status: "APPROVED" } : a
        ));
    };

    const handleReject = (id: number) => {
        toast.error("Request rejected");
        setApprovals(prev => prev.map(a =>
            a.id === id ? { ...a, status: "REJECTED" } : a
        ));
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "APPROVED":
                return "bg-green-100 text-green-700 border-green-200";
            case "REJECTED":
                return "bg-red-100 text-red-700 border-red-200";
            case "PENDING":
                return "bg-amber-100 text-amber-700 border-amber-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const pendingCount = approvals.filter(a => a.status === "PENDING").length;

    return (
        <ModuleLayout title="Approvals">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Pending</p>
                                    <p className="text-3xl font-black text-amber-600 mt-1">{pendingCount}</p>
                                </div>
                                <Clock className="h-8 w-8 text-amber-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Approved</p>
                                    <p className="text-3xl font-black text-green-600 mt-1">
                                        {approvals.filter(a => a.status === "APPROVED").length}
                                    </p>
                                </div>
                                <CheckSquare className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase">Rejected</p>
                                    <p className="text-3xl font-black text-red-600 mt-1">
                                        {approvals.filter(a => a.status === "REJECTED").length}
                                    </p>
                                </div>
                                <XSquare className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Approvals Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                            </div>
                        ) : approvals.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No approvals pending</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Type</TableHead>
                                            <TableHead className="font-semibold">Requested By</TableHead>
                                            <TableHead className="font-semibold">Date</TableHead>
                                            <TableHead className="font-semibold">Description</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {approvals.map((approval) => (
                                            <TableRow key={approval.id} className="hover:bg-slate-50">
                                                <TableCell className="font-medium">{approval.type}</TableCell>
                                                <TableCell>{approval.requestedBy}</TableCell>
                                                <TableCell>{new Date(approval.requestDate).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-slate-600">{approval.description}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusConfig(approval.status)}>
                                                        {approval.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {approval.status === "PENDING" && (
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleApprove(approval.id)}
                                                            >
                                                                <CheckSquare className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:bg-red-50 border-red-200"
                                                                onClick={() => handleReject(approval.id)}
                                                            >
                                                                <XSquare className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    )}
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
