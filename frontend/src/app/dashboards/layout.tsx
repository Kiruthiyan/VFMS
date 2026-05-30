import { Suspense } from "react";
import { ReactNode } from "react";

/**
 * Root layout for all dashboard routes
 * Provides common wrapper for all role-specific dashboards
 */
export const metadata = {
  title: "Dashboard | VFMS",
  description: "Vehicle Fuel Management System Dashboard",
};

export default function DashboardsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      {children}
    </Suspense>
  );
}

function DashboardLoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-block">
          <div className="animate-spin">
            <div className="h-12 w-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full" />
          </div>
        </div>
        <p className="text-slate-400 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );
}
