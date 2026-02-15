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
import Link from "next/link";

/**
 * Validation Schema
 */
const loginSchema = z.object({
    email: z.string().email("Please enter a valid business email address"),
    password: z.string().min(1, "Password is required"),
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
                "Authentication failed. Please check your credentials."
            );
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden relative">

            {/* --- MINIMAL BACKGROUND --- */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-gradient-to-bl from-amber-500/5 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-slate-900/5 to-transparent rounded-tr-full" />
            </div>

            {/* --- MAIN AUTH CARD --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-full max-w-[1000px] min-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row border border-slate-100"
            >
                {/* --- SLIDING OVERLAY PANEL (The Colored Part) --- */}
                <motion.div
                    initial={false}
                    animate={{
                        x: isInfoMode ? "0%" : "100%",
                        borderTopLeftRadius: isInfoMode ? "1.5rem" : "0",
                        borderBottomLeftRadius: isInfoMode ? "1.5rem" : "0",
                        borderTopRightRadius: isInfoMode ? "0" : "1.5rem",
                        borderBottomRightRadius: isInfoMode ? "0" : "1.5rem",
                    }}
                    transition={{ type: "spring", stiffness: 45, damping: 14 }}
                    className="absolute top-0 left-0 w-1/2 h-full bg-slate-900 z-50 hidden md:block overflow-hidden"
                >
                    <div className="relative h-full w-full p-12 flex flex-col justify-center text-white">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />

                        <AnimatePresence mode="wait">
                            {!isInfoMode ? (
                                <motion.div
                                    key="login-msg"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="relative z-10"
                                >
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                                        <Truck className="w-8 h-8 text-amber-400" />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">
                                        Fleet Intelligence <br /><span className="text-amber-400">Simplified.</span>
                                    </h2>
                                    <p className="text-slate-400 font-medium mb-10 leading-relaxed text-lg max-w-sm">
                                        Secure access to vehicle health monitoring, fuel analytics, and trip coordination.
                                    </p>
                                    <Button
                                        onClick={() => setIsInfoMode(true)}
                                        className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-slate-900 font-bold px-8 h-12 rounded-xl transition-all shadow-lg"
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
                                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                                        <ShieldCheck className="w-8 h-8 text-amber-400" />
                                    </div>
                                    <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">
                                        Enterprise <br /><span className="text-amber-400">Security.</span>
                                    </h2>
                                    <p className="text-slate-400 font-medium mb-10 leading-relaxed text-lg max-w-sm">
                                        Access is restricted to authorized personnel. Contact your administrator for provisioning.
                                    </p>
                                    <Button
                                        onClick={() => setIsInfoMode(false)}
                                        className="rounded-xl bg-white text-slate-900 hover:bg-amber-50 font-semibold px-8 h-12 transition-all hover:scale-[1.02]"
                                    >
                                        Back to Login
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* --- LEFT SIDE: LOGIN FORM --- */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white">
                    <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-6 max-w-sm mx-auto w-full">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold tracking-tight text-xl text-slate-900">VFMS<span className="text-amber-500">.</span></span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                            <p className="text-slate-500 text-sm font-medium">Please sign in to your dashboard.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Business Email</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        {...register("email")}
                                        className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-amber-500/20 transition-all rounded-xl font-medium"
                                        placeholder="name@company.com"
                                    />
                                </div>
                                {errors.email && <span className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.email.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Password</Label>
                                    <Link href="/auth/forgot-password">
                                        <span className="text-amber-600 font-semibold text-xs hover:text-amber-700 cursor-pointer hover:underline transition-all">
                                            Forgot Password?
                                        </span>
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                                    <Input
                                        {...register("password")}
                                        type="password"
                                        className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-amber-500/20 transition-all rounded-xl font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <span className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1"><AlertCircle size={12} /> {errors.password.message}</span>}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" className="rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900" />
                            <label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer select-none">Remember for 30 days</label>
                        </div>

                        {loginError && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {loginError}
                            </motion.div>
                        )}

                        <Button
                            disabled={loginLoading}
                            type="submit"
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                        >
                            {loginLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </div>
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </Button>

                        <div className="md:hidden pt-4 text-center">
                            <button onClick={() => setIsInfoMode(true)} type="button" className="text-sm font-semibold text-amber-600 hover:text-amber-700">
                                Need an account?
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- RIGHT SIDE: INFO CONTENT (Shown when info mode is active) --- */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-slate-50">
                    <div className="max-w-sm mx-auto w-full space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Account Access</h2>
                            <p className="text-slate-500 text-sm font-medium">Protocol for new account registration.</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: Building2,
                                    title: "Step 1: Admin Request",
                                    text: "Contact your District or Head Office Admin with your Official Employee ID."
                                },
                                {
                                    icon: Mail,
                                    title: "Step 2: Email Verification",
                                    text: "You will receive a secure link once the Admin creates your profile."
                                },
                                {
                                    icon: CheckCircle2,
                                    title: "Step 3: Setup Password",
                                    text: "Set your secure password via the email link to activate your access."
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:border-amber-400 transition-colors">
                                        <item.icon className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => setIsInfoMode(false)}
                            variant="ghost"
                            className="md:hidden w-full font-semibold text-slate-900 border border-slate-200 bg-white"
                        >
                            <ChevronLeft className="mr-2 w-4 h-4" /> Back to Sign In
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
