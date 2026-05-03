import type { Metadata } from "next";

import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FleetPro",
    template: "%s | FleetPro",
  },
  description: "FleetPro - Company Vehicle Fleet Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-950 antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
