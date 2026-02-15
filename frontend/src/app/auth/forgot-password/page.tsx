"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, ArrowLeft, ShieldCheck, Check } from "lucide-react";
import { AxiosError } from "axios";
import { Label } from "@/components/ui/label";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordValues) => {
        setIsLoading(true);
        setError("");
        try {
            await api.post("/auth/forgot-password", {
                email: data.email,
            });
            // Redirect to verify code page
            router.push(`/auth/set-password?email=${encodeURIComponent(data.email)}`);
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            setError(err.response?.data?.message || "Failed to process request.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
            {/* Minimal Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-amber-100 to-transparent rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-[450px] bg-white rounded-3xl shadow-xl border border-slate-100 relative z-10 overflow-hidden">
                <div className="p-8 pb-4">
                    <button onClick={() => router.push("/auth/login")} className="text-slate-400 hover:text-slate-900 transition-colors mb-6 flex items-center text-sm font-medium">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </button>

                    <div className="space-y-4 text-center">
                        <div className="mx-auto w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <ShieldCheck className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {isSuccess ? "Check your email" : "Reset Password"}
                        </h1>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                            {isSuccess
                                ? "We have sent password reset instructions to your registered email address."
                                : "Enter the email associated with your account and we'll send you a recovery link."}
                        </p>
                    </div>
                </div>

                <div className="p-8 pt-2">
                    {isSuccess ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                <div className="text-sm text-green-800">
                                    <p className="font-semibold">Email Sent!</p>
                                    <p className="text-green-700/80 mt-1">If the email doesn't appear within a few minutes, check your spam folder.</p>
                                </div>
                            </div>
                            <Button onClick={() => router.push("/auth/login")} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md">
                                Return to Sign In
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-12 h-12 bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all font-medium"
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 font-medium border border-red-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending Link...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
