import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardRoleProvider } from "@/components/providers/dashboard-role-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardRoleProvider>
  );
}
