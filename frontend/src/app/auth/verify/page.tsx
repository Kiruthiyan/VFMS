"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";

const setPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type SetPasswordValues = z.infer<typeof setPasswordSchema>;

function VerifyPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { toast } = useToast();
    const { setAuth } = useAuth();

    const [status, setStatus] = useState<"verifying" | "verified" | "error" | "success">("verifying");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMessage("No verification token provided.");
            return;
        }

        const verifyEmail = async () => {
            try {
                await api.get(`/auth/verify-email?token=${token}`);
                setStatus("verified");
            } catch (error: any) {
                setStatus("error");
                setErrorMessage(error.response?.data?.message || "Verification failed. Token may be invalid or expired.");
            }
        };

        verifyEmail();
    }, [token]);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SetPasswordValues>({
        resolver: zodResolver(setPasswordSchema),
    });

    const onSubmit = async (data: SetPasswordValues) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await api.post("/auth/set-password", {
                token,
                password: data.password
            });

            // Login the user immediately after setting password
            setAuth(response.data);

            setStatus("success");

            toast({
                title: "Account Verified!",
                description: "Your password has been set. Redirecting to dashboard...",
            });

            // Determine redirect based on role
            const role = response.data.role;
            setTimeout(() => {
                if (role === 'DRIVER') router.push('/dashboard/driver');
                else if (role === 'APPROVER') router.push('/dashboard/approver');
                else if (role === 'SYSTEM_USER') router.push('/dashboard/staff');
                else router.push('/dashboard');
            }, 2000);

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to set password",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "verifying") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4 animate-pulse">
                    <Loader2 className="h-10 w-10 animate-spin text-amber-500 mx-auto" />
                    <p className="text-slate-500 font-medium">Verifying your account...</p>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md border-0 shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                            <ShieldCheck className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900">Verification Failed</CardTitle>
                        <CardDescription className="text-slate-500 font-medium mt-2">
                            {errorMessage}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-6">
                        <Button onClick={() => router.push("/login")} className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold">
                            Return to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md border-0 shadow-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-emerald-100 p-3 rounded-full w-fit mb-4">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900">All Set!</CardTitle>
                        <CardDescription className="text-slate-500 font-medium mt-2">
                            Your account has been verified and password set. Redirecting you to your dashboard...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-600" />
                <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-black text-slate-900">Set Your Password</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">
                        Your email is verified. Please set a secure password to access your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">New Password</label>
                            <Input
                                type="password"
                                {...register("password")}
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-xs text-red-500 font-bold mt-1">{errors.password.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Confirm Password</label>
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
                            Set Password & Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            </div>
        }>
            <VerifyPageContent />
        </Suspense>
    );
}
