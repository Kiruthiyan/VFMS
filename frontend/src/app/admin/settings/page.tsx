"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Lock, PaintBucket, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account and application preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                {/* Settings Sidebar */}
                <nav className="flex flex-col space-y-1 text-sm text-slate-600">
                    <Button variant="ghost" className="justify-start bg-blue-50 text-blue-700 font-medium">
                        <User className="mr-2 h-4 w-4" /> Profile
                    </Button>
                    <Button variant="ghost" className="justify-start">
                        <Bell className="mr-2 h-4 w-4" /> Notifications
                    </Button>
                    <Button variant="ghost" className="justify-start">
                        <PaintBucket className="mr-2 h-4 w-4" /> Appearance
                    </Button>
                    <Button variant="ghost" className="justify-start">
                        <Lock className="mr-2 h-4 w-4" /> Security
                    </Button>
                </nav>

                {/* Content Area */}
                <div className="space-y-6">
                    {/* Profile Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input id="name" defaultValue="Admin User" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue="admin@fleetpro.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Input id="role" defaultValue="Administrator" disabled className="bg-slate-50 text-slate-500" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-slate-50/50 px-6 py-4">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Save className="mr-2 h-4 w-4" /> Save Changes
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Security Section Placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage your password and security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input id="current-password" type="password" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input id="new-password" type="password" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t bg-slate-50/50 px-6 py-4">
                            <Button variant="outline">Update Password</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
