"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        const role = authService.getRole();
        if (role === 'ADMIN') router.push('/dashboard/admin');
        else if (role === 'APPROVER') router.push('/dashboard/approver'); // Ensure these pages exist or redirect to implemented modules
        else if (role === 'SYSTEM_USER' || role === 'STAFF') router.push('/dashboard/staff');
        else if (role === 'DRIVER') router.push('/fuel'); // Fallback to Fuel for now
        else router.push('/fuel');
    }, [router]);

    return (
        <ModuleLayout title="Redirecting...">
            <div className="flex items-center justify-center h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    <p className="text-slate-500 font-medium">Navigating to your dashboard...</p>
                </div>
            </div>
        </ModuleLayout>
    );
}
