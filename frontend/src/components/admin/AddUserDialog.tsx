"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    Plus,
    Mail,
    ShieldCheck,
    UserPlus,
    CheckCircle2,
    ArrowRight,
    RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddUserDialogProps {
    onUserAdded: () => void;
}

type Step = "email" | "verify" | "profile" | "done";

const STEPS: { key: Step; label: string; icon: React.FC<any> }[] = [
    { key: "email", label: "Email", icon: Mail },
    { key: "verify", label: "Verify", icon: ShieldCheck },
    { key: "profile", label: "Profile", icon: UserPlus },
];

export function AddUserDialog({ onUserAdded }: AddUserDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>("email");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState("");

    const [profile, setProfile] = useState({ name: "", phone: "", role: "SYSTEM_USER" });
    const [profileErrors, setProfileErrors] = useState({ name: "", phone: "" });

    /* ─── Helpers ─── */
    const currentStepIndex = STEPS.findIndex((s) => s.key === step);

    const resetAll = () => {
        setStep("email");
        setEmail("");
        setEmailError("");
        setCode("");
        setCodeError("");
        setProfile({ name: "", phone: "", role: "SYSTEM_USER" });
        setProfileErrors({ name: "", phone: "" });
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(resetAll, 300);
    };

    /* ─── Step 1: Send verification code ─── */
    const handleSendCode = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) { setEmailError("Email is required"); return; }
        if (!emailRegex.test(email)) { setEmailError("Enter a valid email address"); return; }
        setEmailError("");
        setLoading(true);
        try {
            await api.post("/auth/send-verification-code", { email });
            toast.success(`Code sent to ${email}`);
            setStep("verify");
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error || "";
            if (msg.toLowerCase().includes("already")) setEmailError("This email is already registered.");
            else setEmailError("Could not send code. Check the email and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResending(true);
        try {
            await api.post("/auth/send-verification-code", { email });
            toast.success("New code sent!");
            setCode("");
        } catch (err: any) {
            toast.error("Failed to resend code.");
        } finally {
            setResending(false);
        }
    };

    /* ─── Step 2: Verify OTP ─── */
    const handleVerifyCode = async () => {
        if (!code || code.length < 6) { setCodeError("Enter the 6-digit code"); return; }
        setCodeError("");
        setLoading(true);
        try {
            await api.post("/auth/verify-email-code", { email, code });
            toast.success("Email verified!");
            setStep("profile");
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error || "";
            if (msg.toLowerCase().includes("expired")) setCodeError("Code expired. Click \"Resend code\" to get a new one.");
            else if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("no verification")) setCodeError("Wrong code. Check and try again.");
            else setCodeError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ─── Step 3: Create user ─── */
    const handleCreateUser = async () => {
        const errors = { name: "", phone: "" };
        if (!profile.name.trim() || profile.name.trim().length < 2) errors.name = "Full name must be at least 2 characters";
        const phoneRegex = /^[0-9]{10}$/;
        if (!profile.phone) errors.phone = "Phone is required";
        else if (!phoneRegex.test(profile.phone)) errors.phone = "Phone must be 10 digits";
        setProfileErrors(errors);
        if (errors.name || errors.phone) return;

        setLoading(true);
        try {
            await api.post("/auth/signup", {
                name: profile.name.trim(),
                email,
                phone: profile.phone,
                role: profile.role,
            });
            onUserAdded();
            setStep("done");
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error || "";
            if (msg.toLowerCase().includes("already")) toast.error("This email is already registered.");
            else toast.error("Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-900 text-white hover:bg-slate-800 font-medium px-6">
                    <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[480px] p-0 gap-0 border-slate-200 bg-white shadow-2xl overflow-hidden rounded-2xl">

                {/* ── Done screen ── */}
                {step === "done" ? (
                    <div className="flex flex-col items-center text-center px-8 py-10 gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Account Created!</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Login credentials have been sent to <span className="font-semibold text-slate-700">{email}</span>.
                                The user will be asked to set a new password on first login.
                            </p>
                        </div>
                        <Button onClick={handleClose} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white mt-2">
                            Done
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* ── Header with step indicator ── */}
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
                            <DialogTitle className="text-xl font-bold text-slate-900">Add New User</DialogTitle>
                            <div className="flex items-center gap-2 mt-4">
                                {STEPS.map((s, idx) => {
                                    const done = idx < currentStepIndex;
                                    const active = idx === currentStepIndex;
                                    return (
                                        <div key={s.key} className="flex items-center gap-2">
                                            <div className={cn(
                                                "flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all",
                                                done && "bg-green-500 text-white",
                                                active && "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2",
                                                !done && !active && "bg-slate-100 text-slate-400"
                                            )}>
                                                {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                            </div>
                                            <span className={cn(
                                                "text-xs font-semibold",
                                                active ? "text-slate-900" : "text-slate-400"
                                            )}>{s.label}</span>
                                            {idx < STEPS.length - 1 && (
                                                <div className={cn("h-px w-8 mx-1 transition-colors", done ? "bg-green-400" : "bg-slate-200")} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </DialogHeader>

                        <div className="p-6 space-y-5">

                            {/* ── STEP 1: Email ── */}
                            {step === "email" && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                                        <strong>How it works:</strong> Enter the user's email. We'll send them a 6-digit code to confirm the address is real and reachable.
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">User's Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                                            className={cn("h-11", emailError && "border-red-400 focus-visible:ring-red-400")}
                                            autoFocus
                                        />
                                        {emailError && <p className="text-xs text-red-600">{emailError}</p>}
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button type="button" variant="outline" onClick={handleClose} className="flex-1 h-11">Cancel</Button>
                                        <Button onClick={handleSendCode} disabled={loading} className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white">
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                                            {loading ? "Sending..." : "Send Code"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 2: Verify OTP ── */}
                            {step === "verify" && (
                                <div className="space-y-4">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-800">
                                        A 6-digit verification code was sent to <strong>{email}</strong>. Ask the user to check their inbox and share the code with you.
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code" className="text-sm font-semibold text-slate-700">Verification Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="000000"
                                            value={code}
                                            maxLength={6}
                                            onChange={(e) => { setCode(e.target.value.replace(/\D/, "")); setCodeError(""); }}
                                            onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                                            className={cn("h-11 text-center text-xl tracking-[0.5em] font-bold", codeError && "border-red-400 focus-visible:ring-red-400")}
                                            autoFocus
                                        />
                                        {codeError && <p className="text-xs text-red-600">{codeError}</p>}
                                    </div>
                                    <button
                                        onClick={handleResendCode}
                                        disabled={resending}
                                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                                    >
                                        <RefreshCw className={cn("h-3 w-3", resending && "animate-spin")} />
                                        {resending ? "Sending..." : "Resend code"}
                                    </button>
                                    <div className="flex gap-3 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setStep("email")} className="flex-1 h-11">Back</Button>
                                        <Button onClick={handleVerifyCode} disabled={loading} className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white">
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                            {loading ? "Verifying..." : "Verify Code"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 3: Profile ── */}
                            {step === "profile" && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-800 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                        <span><strong>{email}</strong> has been verified. Complete the profile below.</span>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Jane Doe"
                                            value={profile.name}
                                            onChange={(e) => { setProfile(p => ({ ...p, name: e.target.value })); setProfileErrors(e => ({ ...e, name: "" })); }}
                                            className={cn("h-11", profileErrors.name && "border-red-400 focus-visible:ring-red-400")}
                                            autoFocus
                                        />
                                        {profileErrors.name && <p className="text-xs text-red-600">{profileErrors.name}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone</Label>
                                            <Input
                                                id="phone"
                                                placeholder="1234567890"
                                                maxLength={10}
                                                value={profile.phone}
                                                onChange={(e) => { setProfile(p => ({ ...p, phone: e.target.value.replace(/\D/, "") })); setProfileErrors(e => ({ ...e, phone: "" })); }}
                                                className={cn("h-11", profileErrors.phone && "border-red-400 focus-visible:ring-red-400")}
                                            />
                                            {profileErrors.phone && <p className="text-xs text-red-600">{profileErrors.phone}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-slate-700">Role</Label>
                                            <Select value={profile.role} onValueChange={(v) => setProfile(p => ({ ...p, role: v }))}>
                                                <SelectTrigger className="h-11 border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[200]">
                                                    <SelectItem value="SYSTEM_USER">System User</SelectItem>
                                                    <SelectItem value="DRIVER">Driver</SelectItem>
                                                    <SelectItem value="APPROVER">Approver</SelectItem>
                                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
                                        🔒 A secure temporary password will be sent directly to <strong className="text-slate-700">{email}</strong>. It will not be shown here.
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setStep("verify")} className="flex-1 h-11">Back</Button>
                                        <Button onClick={handleCreateUser} disabled={loading} className="flex-1 h-11 bg-slate-900 hover:bg-slate-800 text-white">
                                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                            {loading ? "Creating..." : "Create Account"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
