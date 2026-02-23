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

        // Role-based dashboard routing
        switch (role) {
            case 'ADMIN':
                router.push('/dashboard/admin');
                break;
            case 'APPROVER':
                router.push('/dashboard/approver');
                break;
            case 'SYSTEM_USER':
            case 'STAFF':
                router.push('/dashboard/staff');
                break;
            case 'DRIVER':
                router.push('/dashboard/driver');
                break;
            default:
                // Fallback to staff dashboard for unknown roles
                router.push('/dashboard/staff');
        }
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
