"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, ShieldCheck, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { AxiosError } from "axios";
import { Label } from "@/components/ui/label";

// Step 1: OTP Validation Schema
const verifyOtpSchema = z.object({
    otp: z.string().length(6, "Code must be 6 digits"),
});

// Step 2: Password Reset Schema
const resetPasswordSchema = z.object({
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

type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function SetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email");

    // State: 'verify' (Step 1) -> 'reset' (Step 2)
    const [step, setStep] = useState<'verify' | 'reset'>('verify');
    const [verifiedOtp, setVerifiedOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Step 1 Form
    const {
        register: registerOtp,
        handleSubmit: handleSubmitOtp,
        formState: { errors: otpErrors }
    } = useForm<VerifyOtpValues>({
        resolver: zodResolver(verifyOtpSchema),
    });

    // Step 2 Form
    const {
        register: registerPass,
        handleSubmit: handleSubmitPass,
        formState: { errors: passErrors }
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    // Handle Step 1: Verify OTP
    const onVerifyOtp = async (data: VerifyOtpValues) => {
        setIsLoading(true);
        setError("");
        try {
            // Call backend to verify OTP
            await api.post("/auth/verify-otp", {
                email: email,
                token: data.otp,
            });
            // If successful, move to next step
            setVerifiedOtp(data.otp);
            setStep('reset');
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            setError(err.response?.data?.message || "Invalid verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Step 2: Reset Password
    const onResetPassword = async (data: ResetPasswordValues) => {
        setIsLoading(true);
        setError("");
        try {
            await api.post("/auth/reset-password", {
                email: email,
                token: verifiedOtp, // Use the verified OTP
                password: data.password,
            });
            router.push("/auth/login?message=Password changed successfully. Please login.");
        } catch (error) {
            const err = error as AxiosError<{ message: string }>;
            setError(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
                    <div className="mx-auto w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="h-7 w-7 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Missing Email</h2>
                        <p className="text-slate-500 text-sm mt-1">Please start the process from the login page.</p>
                    </div>
                    <Button onClick={() => router.push("/auth/login")} className="w-full h-11 bg-slate-900 text-white rounded-xl hover:bg-slate-800">
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
            {/* Minimal Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-bl from-amber-100 to-transparent rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-[450px] bg-white rounded-3xl shadow-xl border border-slate-100 relative z-10 overflow-hidden transition-all duration-300">
                <div className="p-8 pb-4">
                    <button onClick={() => router.push("/auth/login")} className="text-slate-400 hover:text-slate-900 transition-colors mb-6 flex items-center text-sm font-medium">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                    </button>

                    <div className="space-y-4 text-center">
                        <div className="mx-auto w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                            {step === 'verify' ? (
                                <KeyRound className="h-7 w-7 text-white" />
                            ) : (
                                <Lock className="h-7 w-7 text-white" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {step === 'verify' ? "Verify Code" : "Set New Password"}
                        </h1>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
                            {step === 'verify'
                                ? <>Enter the 6-digit code sent to <b className="text-slate-900">{email}</b></>
                                : "Create a strong password to secure your account."}
                        </p>
                    </div>
                </div>

                <div className="p-8 pt-2">
                    {/* STEP 1: VERIFY OTP */}
                    {step === 'verify' && (
                        <form onSubmit={handleSubmitOtp(onVerifyOtp)} className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Verification Code</Label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        type="text"
                                        placeholder="e.g. 123456"
                                        maxLength={6}
                                        className="pl-12 h-12 bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all font-mono text-lg tracking-widest"
                                        {...registerOtp("otp")}
                                        disabled={isLoading}
                                    />
                                </div>
                                {otpErrors.otp && <p className="text-xs text-red-500 font-medium mt-1">{otpErrors.otp.message}</p>}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 font-medium border border-red-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</> : "Verify Code"}
                            </Button>
                        </form>
                    )}

                    {/* STEP 2: RESET PASSWORD */}
                    {step === 'reset' && (
                        <form onSubmit={handleSubmitPass(onResetPassword)} className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">New Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 h-12 bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all font-medium"
                                        {...registerPass("password")}
                                        disabled={isLoading}
                                    />
                                </div>
                                {passErrors.password && <p className="text-xs text-red-500 font-medium mt-1">{passErrors.password.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Confirm Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-12 h-12 bg-white border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl transition-all font-medium"
                                        {...registerPass("confirmPassword")}
                                        disabled={isLoading}
                                    />
                                </div>
                                {passErrors.confirmPassword && <p className="text-xs text-red-500 font-medium mt-1">{passErrors.confirmPassword.message}</p>}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 font-medium border border-red-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Updating...</> : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SetPasswordContent />
        </Suspense>
    );
}
