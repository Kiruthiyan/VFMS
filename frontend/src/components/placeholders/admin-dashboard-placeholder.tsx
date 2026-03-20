"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Shield } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { logoutApi, getErrorMessage } from "@/lib/api/auth";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/rbac";
import { Button } from "@/components/ui/button";

export function AdminDashboardPlaceholder() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      // Ignore API error — clear locally anyway
    } finally {
      clearAuth();
      toast.success("Signed out successfully.");
      router.push("/auth/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-sm w-full">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-amber-400" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-100 mb-1">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Welcome back,{" "}
            <span className="text-slate-300 font-medium">
              {user?.fullName}
            </span>
          </p>
        </div>

        {user?.role && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[user.role]}`}
          >
            {ROLE_LABELS[user.role]}
          </span>
        )}

        <p className="text-xs text-slate-600">
          Full admin dashboard is coming in a later feature branch.
        </p>

        <Button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl
                     border border-slate-700 bg-transparent text-slate-400
                     hover:bg-slate-800 hover:text-slate-200 text-sm
                     font-medium transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
