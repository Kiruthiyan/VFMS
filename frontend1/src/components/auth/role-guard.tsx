"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { UserRole } from "@/lib/auth";
import { ROLE_HOME, ROLE_LABELS } from "@/lib/rbac";
import { useAuthStore } from "@/store/auth-store";

interface RoleGuardProps {
  allowedRole: UserRole;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const toastShownRef = useRef(false);

  const isLoading = !hydrated;
  const isAuthenticated = !!accessToken && !!user;
  const hasCorrectRole = user?.role === allowedRole;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/auth/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!hasCorrectRole && user) {
      const homeUrl = ROLE_HOME[user.role];

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

    if (searchParams.get("unauthorized") === "1" && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error("You are not authorized to access that page.", {
        duration: 4000,
      });
    }
  }, [
    hasCorrectRole,
    isAuthenticated,
    isLoading,
    pathname,
    router,
    searchParams,
    user,
  ]);

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
