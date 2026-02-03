"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock, ShieldCheck, ArrowLeft } from "lucide-react";

const setPasswordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords don't match",
            path: ["confirmPassword"],
        });
    }
});

type SetPasswordValues = z.infer<typeof setPasswordSchema>;

export default function SetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SetPasswordValues>({
        resolver: zodResolver(setPasswordSchema),
    });

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans relative">
                <Card className="w-full max-w-md shadow-xl border-0 rounded-3xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                            <Lock className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900">Invalid Link</CardTitle>
                        <CardDescription>The verification token is missing or invalid.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/auth/login")} className="w-full h-11 bg-slate-900 text-white rounded-xl">Back to Login</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const onSubmit = async (data: SetPasswordValues) => {
        setIsLoading(true);
        setError("");
        try {
            await api.post("/auth/set-password", {
                token,
                password: data.password,
            });
            router.push("/auth/login?message=Password set successfully. Please login.");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to set password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
            {/* Background Details */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/10 blur-[120px]" />

            <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl bg-white/80 backdrop-blur-xl relative z-20">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                        <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</CardTitle>
                    <CardDescription className="text-slate-500 text-base">Create a strong password for your account</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl transition-all"
                                    {...register("password")}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl transition-all"
                                    {...register("confirmPassword")}
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500 font-medium ml-1">{errors.confirmPassword.message}</p>}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 font-medium border border-red-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Set Password"}
                        </Button>

                        <div className="text-center pt-2">
                            <button type="button" onClick={() => router.push("/auth/login")} className="text-sm text-slate-500 font-bold hover:text-blue-600 flex items-center justify-center mx-auto transition-colors">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
