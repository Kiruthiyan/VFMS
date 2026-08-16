import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { RoleProvider } from "@/lib/role-context";

export const metadata: Metadata = {
  title: "FleetPro — Fleet Management System",
  description: "FleetPro Vehicle Fleet Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      <body className="antialiased">
        <RoleProvider>
          {children}
        </RoleProvider>
        <Toaster />
        <ToastProvider />
      </body>
    </html>
  );
}
