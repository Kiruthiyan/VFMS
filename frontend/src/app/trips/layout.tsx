"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function TripsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}
