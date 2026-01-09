"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { authService } from "@/lib/auth";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        // Check authentication and role
        if (!authService.isAuthenticated()) {
            router.push("/login");
            return;
        }

        // Check if user is admin
        if (!authService.isAdmin()) {
            // Redirect non-admin users to user panel
            authService.clearAuth();
            window.location.href = "http://localhost:3001/login";
        }
    }, [router]);

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
