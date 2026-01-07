"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
    User,
    Lock,
    Bell,
    Save,
    Shield,
    Mail,
    Smartphone,
    LogOut,
    CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth";

// --- VALIDATION SCHEMAS ---
const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
});

const securitySchema = z.object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function SettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Mock user data - in real app would come from auth context/API
    const user = authService.getUser() || { name: "Admin User", email: "admin@fleet.com", role: "ADMIN" };

    const profileForm = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || "",
            email: user.email || "",
        },
    });

    const securityForm = useForm({
        resolver: zodResolver(securitySchema),
    });

    // --- HANDLERS ---
    const onProfileSubmit = async (data: any) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Profile Update:", data);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-900"
        });
        setIsLoading(false);
    };

    const onSecuritySubmit = async (data: any) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Password Update:", data);
        toast({
            title: "Password Changed",
            description: "Your password has been updated securely.",
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-900"
        });
        securityForm.reset();
        setIsLoading(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 font-medium">Manage your account preferences and security.</p>
            </div>

            <Tabs defaultValue="general" className="w-full space-y-6">
                <TabsList className="bg-slate-100/50 p-1 rounded-xl w-full md:w-auto flex md:inline-flex">
                    <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm font-bold flex-1 md:flex-none px-6">
                        <User className="w-4 h-4 mr-2" /> General
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm font-bold flex-1 md:flex-none px-6">
                        <Lock className="w-4 h-4 mr-2" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm font-bold flex-1 md:flex-none px-6">
                        <Bell className="w-4 h-4 mr-2" /> Notifications
                    </TabsTrigger>
                </TabsList>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-amber-500" /> Profile Information
                            </CardTitle>
                            <CardDescription className="font-medium text-slate-500">Update your account's profile information and email address.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6 max-w-xl">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs font-bold uppercase text-slate-500 tracking-wider">Full Name</Label>
                                        <Input
                                            id="name"
                                            {...profileForm.register("name")}
                                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
                                        />
                                        {profileForm.formState.errors.name && (
                                            <p className="text-red-500 text-xs font-bold mt-1">{profileForm.formState.errors.name.message as string}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email Address</Label>
                                        <Input
                                            id="email"
                                            {...profileForm.register("email")}
                                            className="h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
                                            disabled // Email usually managed by admin or requires verification
                                        />
                                        <p className="text-[11px] text-slate-400 font-medium">To change your email, please contact your administrator.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button type="submit" disabled={isLoading} className="rounded-xl px-8 font-bold bg-slate-900 text-white hover:bg-slate-800">
                                        {isLoading && <span className="animate-spin mr-2">⏳</span>}
                                        Save Changes
                                    </Button>
                                    <p className="text-xs text-slate-400">Last saved: Just now</p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- SECURITY TAB --- */}
                <TabsContent value="security" className="space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-amber-500" /> Password & Security
                            </CardTitle>
                            <CardDescription className="font-medium text-slate-500">Manage your password and security ensure your account is safe.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6 max-w-xl">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Current Password</Label>
                                        <Input type="password" {...securityForm.register("currentPassword")} className="h-12 rounded-xl bg-slate-50" />
                                        {securityForm.formState.errors.currentPassword && (
                                            <p className="text-red-500 text-xs font-bold mt-1">{securityForm.formState.errors.currentPassword.message as string}</p>
                                        )}
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">New Password</Label>
                                            <Input type="password" {...securityForm.register("newPassword")} className="h-12 rounded-xl bg-slate-50" />
                                            {securityForm.formState.errors.newPassword && (
                                                <p className="text-red-500 text-xs font-bold mt-1">{securityForm.formState.errors.newPassword.message as string}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Confirm Password</Label>
                                            <Input type="password" {...securityForm.register("confirmPassword")} className="h-12 rounded-xl bg-slate-50" />
                                            {securityForm.formState.errors.confirmPassword && (
                                                <p className="text-red-500 text-xs font-bold mt-1">{securityForm.formState.errors.confirmPassword.message as string}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="rounded-xl px-8 font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20">
                                    Update Password
                                </Button>
                            </form>

                            <Separator />

                            <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-red-900 mb-1">Log out of all devices</h4>
                                    <p className="text-sm text-red-700/80 font-medium">This will sign you out of all other active sessions.</p>
                                </div>
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-100 font-bold whitespace-nowrap">
                                    <LogOut className="w-4 h-4 mr-2" /> Log Out All
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- NOTIFICATIONS TAB --- */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-500" /> Notification Preferences
                            </CardTitle>
                            <CardDescription className="font-medium text-slate-500">Choose how and when you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-6 max-w-2xl">
                                <div className="flex items-start justify-between space-x-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <Label className="text-base font-bold text-slate-900">Email Notifications</Label>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">Receive daily digests of fleet activity and alerts.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator />
                                <div className="flex items-start justify-between space-x-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Smartphone className="w-4 h-4 text-slate-400" />
                                            <Label className="text-base font-bold text-slate-900">Push Notifications</Label>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">Receive real-time alerts for critical maintenance issues.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Separator />
                                <div className="flex items-start justify-between space-x-4">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shield className="w-4 h-4 text-slate-400" />
                                            <Label className="text-base font-bold text-slate-900">Security Alerts</Label>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">Get notified about new sign-ins or suspicious activity.</p>
                                    </div>
                                    <Switch defaultChecked disabled />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 border-t border-slate-100 px-8 py-4 flex justify-end">
                            <Button variant="ghost" className="text-slate-500 font-bold hover:text-slate-900">Reset to Defaults</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
