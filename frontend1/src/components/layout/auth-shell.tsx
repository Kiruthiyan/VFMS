"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { FleetProLogo } from "@/components/branding/fleetpro-logo";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  eyebrow?: string;
  panelWidth?: "compact" | "standard" | "wide";
}

function AuthBrandPanel() {
  return (
    <aside className="hidden h-screen bg-slate-950 px-8 py-10 text-white lg:flex lg:w-[48%] lg:flex-col xl:px-10">
      <Link href="/" className="self-start">
        <FleetProLogo theme="dark" />
      </Link>

      <div className="flex flex-1 items-center justify-end">
        <div className="max-w-md text-center lg:mr-6 xl:mr-10">
          <div className="mb-6 inline-flex items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
            Fleet Management Platform
          </div>

          <h1 className="mx-auto max-w-md text-[2.1rem] font-black leading-tight tracking-tight text-white xl:text-[2.55rem]">
            Secure access to your FleetPro workspace.
          </h1>

          <div className="mx-auto mt-5 max-w-sm space-y-4 text-sm leading-7 text-slate-300 xl:text-[15px]">
            <p>
              FleetPro provides a secure and professional access portal for
              company fleet operations.
            </p>

            <p>
              Verified users can sign in, register, and continue directly to
              their role-based dashboard.
            </p>

            <p>
              Designed to support user management, approvals, vehicle records,
              and fuel operations in one reliable workspace.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AuthMobileHeader() {
  return (
    <div className="mb-5 rounded-3xl border border-white/10 bg-slate-900 p-4 text-white shadow-xl shadow-black/20 lg:hidden">
      <Link href="/" className="flex items-center justify-center">
        <FleetProLogo theme="dark" size="sm" />
      </Link>

      <div className="mt-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
          Fleet Management Platform
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-300">
          Secure access for verified FleetPro company users.
        </p>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  description,
  children,
  eyebrow = "Account Access",
  panelWidth = "standard",
}: AuthShellProps) {
  const pathname = usePathname();

  const panelWidths = {
    compact: "max-w-md",
    standard: "max-w-lg",
    wide: "max-w-2xl",
  } as const;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-950 lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen flex-col bg-slate-950 lg:h-screen lg:flex-row">
        <AuthBrandPanel />

        <section className="flex min-h-screen flex-1 items-center justify-center bg-slate-950 px-4 py-5 sm:px-6 lg:h-screen lg:min-h-0 lg:w-[52%] lg:flex-none lg:justify-start lg:px-8 lg:py-5 xl:px-10">
          <div className={`w-full ${panelWidths[panelWidth]}`}>
            <AuthMobileHeader />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.985 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                 <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-2xl shadow-black/30 sm:p-6 lg:min-h-[500px] lg:p-6">
                  <div className="mb-4 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      {eyebrow}
                    </p>

                    <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-[1.9rem]">
                      {title}
                    </h1>

                    <p className="max-w-xl text-sm leading-5 text-slate-500">
                      {description}
                    </p>
                  </div>

                  {children}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}
