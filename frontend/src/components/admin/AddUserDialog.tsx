"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Copy, Check, Info } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface AddUserDialogProps {
    onUserAdded: () => void;
}

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<{ email: string; password: string } | null>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "SYSTEM_USER",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (value: string) => {
        setFormData({ ...formData, role: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post("/auth/signup", formData);
            setSuccessData({
                email: formData.email,
                password: response.data.generatedPassword
            });
            onUserAdded();
            toast({
                title: "User Created",
                description: "Invitation sent successfully.",
            });
        } catch (error: any) {
            console.error("Signup error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to create user."
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSuccessData(null);
        setFormData({ name: "", email: "", phone: "", role: "SYSTEM_USER" });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard" });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 text-white hover:bg-slate-800 transition-all font-medium px-6">
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] p-0 gap-0 border-slate-200 bg-white shadow-xl overflow-hidden rounded-xl">
                {successData ? (
                    <div className="flex flex-col">
                        <div className="p-8 pb-6 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <Check className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Account Created</h2>
                                <p className="text-slate-500 text-sm mt-1">Successfully registered {successData.email}.</p>
                            </div>
                        </div>

                        <div className="px-8 pb-8 space-y-6">
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</Label>
                                        <button onClick={() => copyToClipboard(successData.email)} className="text-xs text-blue-600 font-medium hover:underline">Copy</button>
                                    </div>
                                    <p className="font-medium text-slate-900 text-sm break-all">{successData.email}</p>
                                </div>
                                <div className="h-px bg-slate-200" />
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temp Password</Label>
                                        <button onClick={() => copyToClipboard(successData.password)} className="text-xs text-blue-600 font-medium hover:underline">Copy</button>
                                    </div>
                                    <p className="font-mono text-base font-bold text-slate-900 tracking-wide">{successData.password}</p>
                                </div>
                            </div>

                            <div className="bg-amber-50 rounded-md p-3 flex gap-3 text-amber-800 text-xs">
                                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>This password is temporary. The user will be asked to create a new password on first login.</p>
                            </div>

                            <Button onClick={handleClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11">
                                Done
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="p-6 pb-2">
                            <DialogTitle className="text-xl font-bold text-slate-900">Add New User</DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm mt-1.5">
                                Enter the user's details to create their account. Use a valid email address.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 pt-2 grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Jane Doe"
                                    className="h-10 border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-slate-900"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    className="h-10 border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-slate-900"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        className="h-10 border-slate-200 bg-white placeholder:text-slate-400 focus-visible:ring-slate-900"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="role" className="text-sm font-medium text-slate-700">Role</Label>
                                    <Select value={formData.role} onValueChange={handleRoleChange}>
                                        <SelectTrigger className="h-10 border-slate-200 bg-white focus:ring-slate-900">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[200]">
                                            <SelectItem value="SYSTEM_USER">System User</SelectItem>
                                            <SelectItem value="DRIVER">Driver</SelectItem>
                                            <SelectItem value="ADMIN">Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-0">
                            <div className="flex w-full gap-3">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 h-11 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-sm disabled:opacity-50">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
