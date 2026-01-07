"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Lock, ShieldCheck, ArrowRight,
    Fingerprint, Activity, ChevronLeft,
    AlertCircle, CheckCircle2, Building2, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { authService } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * Validation Schema
 */
const loginSchema = z.object({
    email: z.string().email("Please enter a valid business email address"),
    password: z.string().min(6, "Security protocol requires at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface SlidingAuthPageProps {
    initialMode?: "login" | "signup";
}

export default function SlidingAuthPage({ initialMode = "login" }: SlidingAuthPageProps) {
    const router = useRouter();

    // isInfoMode = true means the "How to Register" side is visible (signup mode)
    const [isInfoMode, setIsInfoMode] = useState(initialMode === "signup");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    });

    /**
     * Redirect if already authenticated
     */
    useEffect(() => {
        if (authService.isAuthenticated()) {
            redirectByRole(authService.getRole());
        }
    }, [router]);

    const redirectByRole = (role: string | null) => {
        switch (role) {
            case "ADMIN": router.push("/dashboard/admin"); break;
            case "APPROVER": router.push("/dashboard/approver"); break;
            case "SYSTEM_USER": router.push("/dashboard/staff"); break;
            case "STAFF": router.push("/dashboard/staff"); break;
            case "DRIVER": router.push("/dashboard/driver"); break;
            default: router.push("/dashboard");
        }
    };

    /**
     * Handle Login Submission
     */
    const onLoginSubmit = async (data: LoginValues) => {
        setLoginError("");
        setLoginLoading(true);
        try {
            // API call to Spring Boot Backend
            const response = await api.post("/auth/authenticate", data);
            const authData = response.data;

            // Store JWT and User data
            authService.setAuth(authData);

            // Check if password change is required
            if (authData.passwordChangeRequired) {
                router.push("/auth/change-password");
                return;
            }

            // Trigger redirection based on role embedded in JWT
            redirectByRole(authData.role);
        } catch (err: any) {
            setLoginError(
                err.response?.data?.message ||
                "Authentication failed. Please check your credentials or contact the Admin."
            );
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden relative selection:bg-amber-200">

            {/* --- AMBIENT BRANDED BACKGROUND --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-100/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
            </div>

            {/* --- MAIN AUTH CARD --- */}
            <motion.div
                layout
                className="relative w-full max-w-[1100px] min-h-[700px] bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 flex overflow-hidden z-10"
            >
                {/* --- SLIDING OVERLAY PANEL (The Colored Part) --- */}
                <motion.div
                    initial={false}
                    animate={{ x: isInfoMode ? "100%" : "0%" }}
                    transition={{ type: "spring", stiffness: 45, damping: 14 }}
                    className="absolute top-0 left-0 w-1/2 h-full bg-slate-900 z-50 hidden md:block overflow-hidden"
                >
                    <div className="relative h-full w-full p-16 flex flex-col justify-center text-white">
                        {/* Mesh Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-slate-900 opacity-60" />

                        <AnimatePresence mode="wait">
                            {!isInfoMode ? (
                                <motion.div
                                    key="login-msg"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="relative z-10"
                                >
                                    <div className="w-20 h-20 bg-amber-500/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-10 border border-white/10 ring-1 ring-white/5">
                                        <Fingerprint className="w-10 h-10 text-amber-400" />
                                    </div>
                                    <h2 className="text-5xl font-black tracking-tighter mb-6 leading-[1.1]">
                                        Fleet Intelligence <br /><span className="text-amber-400">Starts Here.</span>
                                    </h2>
                                    <p className="text-slate-400 font-medium mb-12 leading-relaxed text-lg max-w-sm">
                                        Log in to monitor vehicle health, fuel efficiency, and real-time trip schedules.
                                    </p>
                                    <Button
                                        onClick={() => setIsInfoMode(true)}
                                        variant="outline"
                                        className="rounded-full border-white/20 text-white hover:bg-white hover:text-slate-900 font-bold px-10 h-14"
                                    >
                                        No Account? Request Access
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="signup-msg"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="relative z-10"
                                >
                                    <div className="w-20 h-20 bg-slate-800 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-10 border border-white/10">
                                        <ShieldCheck className="w-10 h-10 text-amber-400" />
                                    </div>
                                    <h2 className="text-5xl font-black tracking-tighter mb-6 leading-[1.1]">
                                        Enterprise <br />Security <span className="text-amber-400">First.</span>
                                    </h2>
                                    <p className="text-slate-400 font-medium mb-12 leading-relaxed text-lg max-w-sm">
                                        To maintain data integrity, accounts can only be provisioned by authorized Administrators.
                                    </p>
                                    <Button
                                        onClick={() => setIsInfoMode(false)}
                                        className="rounded-full bg-white text-slate-900 hover:bg-amber-50 font-bold px-10 h-14"
                                    >
                                        Back to Login
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* --- LEFT SIDE: LOGIN FORM --- */}
                <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center bg-white">
                    <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-8 max-w-sm mx-auto w-full">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-slate-900" />
                                </div>
                                <span className="font-black tracking-tighter text-xl">VFMS<span className="text-amber-500">.</span></span>
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Sign in to your account</p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400">Business Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    <Input
                                        {...register("email")}
                                        className="pl-11 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:ring-amber-500 transition-all rounded-2xl font-medium"
                                        placeholder="name@company.com"
                                    />
                                </div>
                                {errors.email && <span className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.email.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400">Password</Label>
                                    <Button variant="link" size="sm" className="text-amber-600 font-black text-[11px] uppercase p-0 h-auto">Forgot Key?</Button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    <Input
                                        {...register("password")}
                                        type="password"
                                        className="pl-11 h-14 bg-slate-50 border-slate-200 focus:bg-white focus:ring-amber-500 transition-all rounded-2xl font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <span className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.password.message}</span>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 py-1">
                            <Checkbox id="remember" className="rounded-md border-slate-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500" />
                            <label htmlFor="remember" className="text-xs font-bold text-slate-600 cursor-pointer select-none">Remember this device for 30 days</label>
                        </div>

                        {loginError && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                    <Activity className="w-4 h-4" />
                                </div>
                                {loginError}
                            </motion.div>
                        )}

                        <Button
                            disabled={loginLoading}
                            type="submit"
                            className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.25rem] font-black text-base transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                        >
                            {loginLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Launch Dashboard <ArrowRight className="w-5 h-5" />
                                </div>
                            )}
                        </Button>

                        <div className="md:hidden pt-4 text-center">
                            <button onClick={() => setIsInfoMode(true)} type="button" className="text-sm font-black text-amber-600">
                                Registration Help?
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- RIGHT SIDE: INFO CONTENT (Shown when info mode is active) --- */}
                <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center bg-slate-50/50">
                    <div className="max-w-sm mx-auto w-full space-y-10">
                        <div className="space-y-3">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Account Protocol</h2>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Follow these steps for access</p>
                        </div>

                        <div className="space-y-8">
                            {[
                                {
                                    icon: Building2,
                                    title: "Administrator Request",
                                    text: "Contact your District or Head Office Admin with your Official Employee ID."
                                },
                                {
                                    icon: Mail,
                                    title: "Verification Email",
                                    text: "You will receive a secure link once the Admin creates your profile."
                                },
                                {
                                    icon: CheckCircle2,
                                    title: "Password Initialization",
                                    text: "Set your secure password and verify your business email to activate access."
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-5 group">
                                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-amber-500 transition-colors">
                                        <item.icon className="w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-[15px] font-black text-slate-900 mb-1">{item.title}</h4>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-sm shrink-0">
                                <ShieldCheck className="w-6 h-6 text-slate-900" />
                            </div>
                            <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest leading-normal">
                                Automated tracking of all login attempts and IP addresses is active.
                            </p>
                        </div>

                        <Button
                            onClick={() => setIsInfoMode(false)}
                            variant="ghost"
                            className="md:hidden w-full font-black text-slate-900 h-14"
                        >
                            <ChevronLeft className="mr-2 w-4 h-4" /> Back to Sign In
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
