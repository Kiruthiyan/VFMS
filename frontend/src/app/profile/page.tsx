"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Calendar, Shield, Key, Loader2 } from "lucide-react";
import { authService } from "@/lib/auth";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        id: 0,
        name: "",
        email: "",
        phone: "",
        role: "",
        joinedDate: "",
    });

    const [profileForm, setProfileForm] = useState({
        name: "",
        phone: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const userId = authService.getUserId();
        const name = authService.getUserName();
        const email = authService.getUserEmail();
        const role = authService.getRole();

        setUserData({
            id: userId || 0,
            name: name || "",
            email: email || "",
            phone: "",
            role: role || "",
            joinedDate: new Date().toLocaleDateString(),
        });

        setProfileForm({
            name: name || "",
            phone: "",
        });
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: Implement backend profile update endpoint
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/auth/change-password", {
                userId: userData.id,
                newPassword: passwordForm.newPassword,
            });

            toast.success("Password changed successfully!");
            setPasswordForm({ newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            ADMIN: "bg-purple-100 text-purple-700",
            SYSTEM_USER: "bg-blue-100 text-blue-700",
            APPROVER: "bg-green-100 text-green-700",
            DRIVER: "bg-amber-100 text-amber-700",
        };
        return colors[role] || "bg-slate-100 text-slate-700";
    };

    if (!authService.isAuthenticated()) {
        router.push("/login");
        return null;
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">My Profile</h2>
                <p className="text-slate-500 font-medium mt-2">Manage your account settings and preferences</p>
            </div>

            {/* Profile Overview Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your personal account details</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6 mb-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={""} alt={userData.name} />
                            <AvatarFallback className="text-2xl bg-amber-100 text-amber-700">
                                {getInitials(userData.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900">{userData.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Mail className="h-4 w-4" />
                                {userData.email}
                            </div>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(userData.role)}`}>
                                <Shield className="h-3 w-3" />
                                {userData.role}
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    <User className="inline h-4 w-4 mr-2" />
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    <Phone className="inline h-4 w-4 mr-2" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    <Mail className="inline h-4 w-4 mr-2" />
                                    Email
                                </Label>
                                <Input value={userData.email} disabled className="bg-slate-50" />
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    <Calendar className="inline h-4 w-4 mr-2" />
                                    Member Since
                                </Label>
                                <Input value={userData.joinedDate} disabled className="bg-slate-50" />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <Key className="inline h-5 w-5 mr-2" />
                        Change Password
                    </CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                    minLength={8}
                                />
                                <p className="text-xs text-slate-500">Minimum 8 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} variant="outline">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Change Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
