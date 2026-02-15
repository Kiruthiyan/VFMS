"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, Shield, Phone, Mail, User as UserIcon, Loader2, Trash, Plus, Users } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner"; // Added sonner toast
import { AddUserDialog } from "@/components/admin/AddUserDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog"; // Added ConfirmDialog
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"; // Added LoadingSkeleton
import { EmptyState } from "@/components/ui/empty-state"; // Added EmptyState
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Added Dialog components
import { Label } from "@/components/ui/label"; // Added Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added Select components


interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    joinedDate: string;
}

export default function UserManagementPage() {
    const { toast: shadToast } = useToast(); // Renamed shadcn toast
    const [users, setUsers] = useState<any[]>([]); // Changed type to any[]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // Added error state
    const [dialogOpen, setDialogOpen] = useState(false); // Added dialogOpen state
    const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: 0, userName: "" }); // Added deleteDialog state

    const fetchUsers = async () => {
        setLoading(true);
        setError(null); // Reset error
        try {
            const response = await api.get("/users"); // Removed /api prefix
            setUsers(response.data);
        } catch (error: any) {
            console.error("Failed to fetch users:", error);
            setError(error.response?.data?.message || "Failed to load users"); // Set error state
            toast.error("Failed to load users"); // Using sonner toast
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async () => {
        try {
            await api.delete(`/users/${deleteDialog.userId}`);
            toast.success(`User ${deleteDialog.userName} deleted successfully`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete user");
        } finally {
            setDeleteDialog({ open: false, userId: 0, userName: "" });
        }
    };

    return (
        <ModuleLayout title="User Management">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">System Users</h2>
                        <p className="text-muted-foreground">Manage access and roles for all personnel.</p>
                    </div>
                    <AddUserDialog onUserAdded={fetchUsers} />
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-4 border-b flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search users..." className="pl-9" />
                        </div>
                    </div>

                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <UserIcon className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Mail className="h-3 w-3" /> {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Phone className="h-3 w-3" /> {user.phone || "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={user.status === 'ACTIVE' ? "bg-green-100 text-green-700" : ""}>
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setDeleteDialog({ open: true, userId: user.id, userName: user.name })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                onConfirm={handleDelete}
                title="Delete User"
                description={`Are you sure you want to delete ${deleteDialog.userName}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />
        </ModuleLayout>
    );
}
