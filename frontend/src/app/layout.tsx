import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { RoleProvider } from "@/lib/role-context";
import { RoleSwitcher } from "@/components/RoleSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin Portal",
  description: "VFMS Admin Panel",
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
          <RoleSwitcher />
          <div className="pt-10">
            {children}
          </div>
        </RoleProvider>
        <Toaster />
        <ToastProvider />
      </body>
    </html>
  );
}
