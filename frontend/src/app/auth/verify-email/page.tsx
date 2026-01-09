"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token found.");
            return;
        }

        const verify = async () => {
            try {
                await api.get(`/auth/verify-email?token=${token}`);
                setStatus("success");
                // Redirect to set password after 2 seconds
                setTimeout(() => {
                    router.push(`/auth/set-password?token=${token}`);
                }, 2000);
            } catch (err: any) {
                setStatus("error");
                setMessage(err.response?.data?.message || "Verification failed. Token may be invalid or expired.");
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans relative overflow-hidden">
            {/* Background Details */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]" />

            <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl bg-white/80 backdrop-blur-xl relative z-20">
                <CardHeader className="text-center space-y-4 pb-2">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                        <MailCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">Email Verification</CardTitle>
                    <CardDescription className="text-slate-500 text-base">Wait while we verify your account</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-6 py-6 text-center">
                    {status === "loading" && (
                        <div className="space-y-4">
                            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-slate-600 font-medium animate-pulse">Verifying your token...</p>
                        </div>
                    )}
                    {status === "success" && (
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-green-100/50 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Success!</h3>
                                <p className="text-slate-500 text-sm mt-1">Your email has been verified.</p>
                            </div>
                            <div className="pt-2">
                                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">Redirecting...</p>
                            </div>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="space-y-6 w-full">
                            <div className="mx-auto w-16 h-16 bg-red-100/50 rounded-full flex items-center justify-center">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Verification Failed</h3>
                                <p className="text-slate-500 text-sm mt-2 max-w-[280px] mx-auto leading-relaxed">{message}</p>
                            </div>
                            <Button onClick={() => router.push("/auth/login")} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl mt-4">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
