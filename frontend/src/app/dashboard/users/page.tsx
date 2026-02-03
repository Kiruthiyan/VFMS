"use client";

import { useState, useEffect } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const inviteUserSchema = z.object({
    name: z.string().min(2, "Name is required"),
    role: z.enum(["ADMIN", "SYSTEM_USER", "DRIVER", "APPROVER"]),
});

type InviteUserValues = z.infer<typeof inviteUserSchema>;



// Schema for editing (same as invite for now, but separates concerns)
const editUserSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    role: z.enum(["ADMIN", "SYSTEM_USER", "DRIVER", "APPROVER"]),
});

type EditUserValues = z.infer<typeof editUserSchema>;

export default function UsersPage() {
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // Edit State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string, password: string, role: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const { toast } = useToast();

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get("/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    // --- CREATE FORM ---
    const {
        register: registerInvite,
        handleSubmit: handleSubmitInvite,
        setValue: setValueInvite,
        reset: resetInvite,
        watch: watchInvite,
        formState: { errors: errorsInvite }
    } = useForm<InviteUserValues>({
        resolver: zodResolver(inviteUserSchema),
        defaultValues: { role: "SYSTEM_USER" }
    });

    useEffect(() => {
        if (isInviteOpen) {
            resetInvite({ name: "", role: "SYSTEM_USER" });
        }
    }, [isInviteOpen, resetInvite]);

    const onInviteSubmit = async (data: InviteUserValues) => {
        setIsLoading(true);
        try {
            const response = await api.post("/auth/signup", {
                ...data,
                email: "placeholder",
            });

            setCreatedCredentials({
                email: response.data.email,
                password: response.data.generatedPassword,
                role: response.data.role
            });

            toast({ title: "User Created", description: `Successfully created user ${data.name}` });
            setIsInviteOpen(false);
            setIsCredentialsOpen(true);
            resetInvite();
            fetchUsers();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to create user",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // --- EDIT FORM ---
    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        setValue: setValueEdit,
        reset: resetEdit,
        watch: watchEdit,
        formState: { errors: errorsEdit }
    } = useForm<EditUserValues>({
        resolver: zodResolver(editUserSchema),
    });

    // Populate edit form when user is selected
    useEffect(() => {
        if (editingUser) {
            resetEdit({
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role
            });
            setIsEditOpen(true);
        }
    }, [editingUser, resetEdit]);

    const onEditSubmit = async (data: EditUserValues) => {
        if (!editingUser) return;
        setIsLoading(true);
        try {
            await api.put(`/users/${editingUser.id}`, data);
            toast({ title: "User Updated", description: "User details have been updated successfully." });
            setIsEditOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to update user",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!editingUser) return;
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        setIsLoading(true);
        try {
            await api.delete(`/users/${editingUser.id}`);
            toast({ title: "User Deleted", description: "User has been removed from the system." });
            setIsEditOpen(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to delete user",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage system access, roles, and permissions.</p>
                </div>

                {/* Credentials Success Dialog */}
                <Dialog open={isCredentialsOpen} onOpenChange={setIsCredentialsOpen}>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="space-y-3 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                                <Plus className="w-6 h-6 text-emerald-600" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-900 text-center">User Created Successfully</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium text-center">
                                Please copy these credentials and share them with the user securely.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Email</p>
                                <p className="text-lg font-bold text-slate-900 select-all font-mono">{createdCredentials?.email}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Temporary Password</p>
                                <p className="text-lg font-bold text-amber-600 select-all font-mono">{createdCredentials?.password}</p>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                                <Loader2 className="w-4 h-4 shrink-0" /> User will be asked to change password on first login.
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsCredentialsOpen(false)} className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold">
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Invite Dialog */}
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 font-bold rounded-xl px-6">
                            <Plus className="mr-2 h-5 w-5" /> Create User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="space-y-3 pb-4 border-b border-slate-100">
                            <DialogTitle className="text-2xl font-black text-slate-900">Create New User</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">
                                Enter user details. Credentials will be auto-generated.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitInvite(onInviteSubmit)} className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Full Name</label>
                                <Input placeholder="e.g. Sarah Smith" {...registerInvite("name")} className="h-11 rounded-xl bg-white text-slate-900 border-slate-200 focus:border-slate-400 transition-all" />
                                {errorsInvite.name && <p className="text-xs text-red-500 font-bold mt-1">{errorsInvite.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Role</label>
                                <Select
                                    onValueChange={(val) => setValueInvite("role", val as any)}
                                    defaultValue="SYSTEM_USER"
                                    value={watchInvite("role")}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                        <SelectItem value="ADMIN" className="font-medium focus:bg-slate-50 cursor-pointer">Admin</SelectItem>
                                        <SelectItem value="SYSTEM_USER" className="font-medium focus:bg-slate-50 cursor-pointer">Staff (System User)</SelectItem>
                                        <SelectItem value="APPROVER" className="font-medium focus:bg-slate-50 cursor-pointer">Approver</SelectItem>
                                        <SelectItem value="DRIVER" className="font-medium focus:bg-slate-50 cursor-pointer">Driver</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errorsInvite.role && <p className="text-xs text-red-500 font-bold mt-1">{errorsInvite.role.message}</p>}
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Generate Account
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit User Dialog */}
                <Dialog open={isEditOpen} onOpenChange={(open) => !open && setEditingUser(null)}>
                    <DialogContent className="sm:max-w-[425px] rounded-2xl border-0 shadow-2xl">
                        <DialogHeader className="space-y-3 pb-4 border-b border-slate-100">
                            <DialogTitle className="text-2xl font-black text-slate-900">Edit User</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">
                                Update user details or change their role.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Full Name</label>
                                <Input {...registerEdit("name")} className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                                {errorsEdit.name && <p className="text-xs text-red-500 font-bold mt-1">{errorsEdit.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email Address</label>
                                <Input disabled {...registerEdit("email")} className="h-11 rounded-xl bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed" />
                                <p className="text-[10px] text-slate-400 font-bold">Email cannot be changed.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Role</label>
                                <Select
                                    onValueChange={(val) => setValueEdit("role", val as any)}
                                    // defaultValue={editingUser?.role} // Avoid stale default
                                    value={watchEdit("role")}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl border-slate-100">
                                        <SelectItem value="ADMIN" className="font-medium focus:bg-slate-50 cursor-pointer">Admin</SelectItem>
                                        <SelectItem value="SYSTEM_USER" className="font-medium focus:bg-slate-50 cursor-pointer">Staff (System User)</SelectItem>
                                        <SelectItem value="APPROVER" className="font-medium focus:bg-slate-50 cursor-pointer">Approver</SelectItem>
                                        <SelectItem value="DRIVER" className="font-medium focus:bg-slate-50 cursor-pointer">Driver</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errorsEdit.role && <p className="text-xs text-red-500 font-bold mt-1">{errorsEdit.role.message}</p>}
                            </div>
                            <DialogFooter className="pt-2 flex gap-2 w-full">
                                <Button type="button" onClick={handleDeleteUser} disabled={isLoading} variant="destructive" className="flex-1 h-11 rounded-xl font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-none">
                                    Delete User
                                </Button>
                                <Button type="submit" disabled={isLoading} className="flex-[2] h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider">User</th>
                            <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider">Contact</th>
                            <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider">Role</th>
                            <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-900 uppercase text-xs tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
                                <td className="px-6 py-4 text-slate-500 font-medium">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide
                                        ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'DRIVER' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-700">
                                        {user.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button onClick={() => setEditingUser(user)} variant="ghost" size="sm" className="hover:bg-slate-100 text-slate-400 hover:text-slate-900 font-bold">Edit</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
