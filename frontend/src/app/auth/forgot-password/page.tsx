"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, Shield } from "lucide-react";

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
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to process request.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
            {/* Background Details */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-400/10 blur-[120px]" />

            <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl bg-white/80 backdrop-blur-xl relative z-20">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                        {isSuccess ? "Check your email" : "Reset Password"}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-base">
                        {isSuccess
                            ? "We have sent a password reset link to your email."
                            : "Enter your email to receive instructions."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {isSuccess ? (
                        <Button onClick={() => router.push("/auth/login")} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold" variant="default">
                            Back to Login
                        </Button>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-12 h-12 bg-slate-50 border-slate-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl transition-all"
                                        {...register("email")}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 font-medium border border-red-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Reset Link"}
                            </Button>

                            <div className="text-center pt-2">
                                <button type="button" onClick={() => router.push("/auth/login")} className="text-sm text-slate-500 font-bold hover:text-blue-600 flex items-center justify-center mx-auto transition-colors">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                                </button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
