import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { RoleProvider as TripsRoleProvider } from "@/lib/roleContext";
const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <TripsRoleProvider>
          {children}
        </TripsRoleProvider>
        <Toaster />
        <ToastProvider />
      </body>
    </html>
  );
}
