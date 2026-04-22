import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { RoleProvider } from "@/lib/role-context";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} antialiased`}>
        <RoleProvider>
          {children}
        </RoleProvider>
        <Toaster />
        <ToastProvider />
      </body>
    </html>
  );
}
