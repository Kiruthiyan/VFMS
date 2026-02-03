"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth";

const changePasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
    const router = useRouter();
    const { toast } = useToast();
    // Get user from authService
    const user = authService.getUser();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = async (data: ChangePasswordValues) => {
        if (!user?.id) {
            toast({ title: "Error", description: "User session not found. Please log in again." });
            router.push("/login");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/auth/change-password", {
                userId: Number(user.id),
                newPassword: data.password
            });

            // Update local storage to reflect password change not required anymore? 
            // Actually we just proceed. The backend token is still valid.
            // But we should probably update the local user state to avoid redirect loop if we check it elsewhere.
            // Ideally we would refresh token but for MVP we just redirect.

            toast({
                title: "Password Updated",
                description: "Your password has been changed securely. Accessing dashboard...",
            });

            // Redirect based on role
            const role = user.role;
            setTimeout(() => {
                if (role === 'DRIVER') router.push('/dashboard/driver');
                else if (role === 'APPROVER') router.push('/dashboard/approver');
                else if (role === 'SYSTEM_USER') router.push('/dashboard/staff');
                else router.push('/dashboard');
            }, 1500);

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update password",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-amber-500" />
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto bg-amber-100 p-3 rounded-full w-fit mb-4">
                        <ShieldAlert className="h-8 w-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900">Security Update Required</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        For your security, you must update your temporary password before accessing the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">New Secure Password</label>
                            <Input
                                type="password"
                                {...register("password")}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-xs text-red-500 font-bold mt-1">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Confirm New Password</label>
                            <Input
                                type="password"
                                {...register("confirmPassword")}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <p className="text-xs text-red-500 font-bold mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-11 mt-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/10">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Update Password & Continue
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
