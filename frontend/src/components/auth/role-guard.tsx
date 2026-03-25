"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/lib/api/auth";
import { ROLE_HOME, ROLE_LABELS } from "@/lib/rbac";

interface RoleGuardProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const toastShownRef = useRef(false);

  const isLoading = accessToken === null && user === null;
  const isAuthenticated = !!accessToken && !!user;
  const hasCorrectRole = user?.role === allowedRole;

  useEffect(() => {
    if (isLoading) return;

    // Not logged in
    if (!isAuthenticated) {
      router.replace(`/auth/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    // Wrong role
    if (!hasCorrectRole && user) {
      const homeUrl = ROLE_HOME[user.role];

      // Show toast only once per navigation
      if (!toastShownRef.current) {
        toastShownRef.current = true;
        toast.error(
          `Access denied. Redirecting to your ${ROLE_LABELS[user.role]} dashboard.`,
          { duration: 4000 }
        );
      }

      router.replace(homeUrl);
      return;
    }

    // Show unauthorized toast if redirected here with ?unauthorized=1
    if (
      searchParams.get("unauthorized") === "1" &&
      !toastShownRef.current
    ) {
      toastShownRef.current = true;
      toast.error("You are not authorized to access that page.", {
        duration: 4000,
      });
    }
  }, [
    isLoading,
    isAuthenticated,
    hasCorrectRole,
    user,
    router,
    pathname,
    searchParams,
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or wrong role — show nothing while redirecting
  if (!isAuthenticated || !hasCorrectRole) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm text-slate-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}