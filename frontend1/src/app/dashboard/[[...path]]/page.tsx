"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { ROLE_DASHBOARDS } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";

export default function LegacyDashboardRedirectPage() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (accessToken && user) {
      const destination =
        ROLE_DASHBOARDS[user.role] ?? ROLE_DASHBOARDS.ADMIN;
      router.replace(destination);
      return;
    }

    router.replace(
      `/auth/login?from=${encodeURIComponent(pathname ?? "/dashboard")}`
    );
  }, [accessToken, hydrated, pathname, router, user]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm text-slate-500">Redirecting...</p>
      </div>
    </div>
  );
}
