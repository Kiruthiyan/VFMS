import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { BrowserExtensionErrorGuard } from "@/components/providers/BrowserExtensionErrorGuard";
import { QueryProvider } from "@/components/providers/query-provider";
import { RoleProvider } from "@/lib/role-context";

export const metadata: Metadata = {
  title: "FleetPro - Fleet Management System",
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
        <BrowserExtensionErrorGuard />
        <QueryProvider>
          <RoleProvider>
            {children}
          </RoleProvider>
        </QueryProvider>
        <Toaster />
        <ToastProvider />
      </body>
    </html>
  );
}

