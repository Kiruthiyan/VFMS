"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AUTH_ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const isLoading = !hydrated;
  const isAuthenticated = !!accessToken && !!user;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(AUTH_ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
