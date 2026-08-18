"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { Briefcase, Car, Droplets, Users } from "lucide-react";

import { FleetProLogo } from "@/components/branding/fleetpro-logo";
import { AUTH_ROUTES } from "@/lib/constants/routes";

const BRAND_HIGHLIGHTS = [
  { icon: Car, label: "Vehicles" },
  { icon: Briefcase, label: "Trips" },
  { icon: Users, label: "Drivers" },
  { icon: Droplets, label: "Fuel" },
];

const AUTH_ROUTE_ORDER = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.SIGNUP,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
];

const panelVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
};

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  eyebrow?: string;
  panelWidth?: "compact" | "standard" | "wide";
}

function RouteAccent() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-8 bottom-24 h-40 w-auto opacity-[0.14] xl:inset-x-10"
      viewBox="0 0 320 160"
      fill="none"
    >
      <path
        d="M4 140c48-4 72-46 120-52s96 32 148 20"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1 14"
      />
      <circle cx="4" cy="140" r="4" fill="#fbbf24" />
      <path
        d="M272 92c-6.6 0-12 5.2-12 11.6 0 8.7 12 16.4 12 16.4s12-7.7 12-16.4c0-6.4-5.4-11.6-12-11.6Z"
        fill="#fbbf24"
      />
    </svg>
  );
}

function AuthBrandPanel() {
  return (
    <aside className="relative hidden h-screen flex-col overflow-hidden bg-transparent px-8 py-10 text-white md:flex md:w-[48%] xl:px-10">
      <Link href="/" className="relative z-10 self-start">
        <FleetProLogo theme="dark" />
      </Link>

      <RouteAccent />

      <div className="relative z-10 flex flex-1 items-center justify-end">
        <div className="max-w-md text-center lg:mr-6 xl:mr-10">
          <div className="auth-brand-pill mb-6 inline-flex items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
            Fleet Management Platform
          </div>

          <h1 className="mx-auto max-w-md text-[2.1rem] font-black leading-tight tracking-tight text-white xl:text-[2.55rem]">
            Manage your fleet with confidence.
          </h1>

          <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-slate-300 xl:text-[15px]">
            Manage vehicles, trips, drivers and fuel operations from one
            secure workspace.
          </p>

          <div className="mx-auto mt-8 flex max-w-sm items-start justify-center gap-8">
            {BRAND_HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10">
                  <Icon className="h-5 w-5 text-amber-300" strokeWidth={1.75} />
                </span>
                <span className="text-xs font-medium text-slate-100">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function AuthMobileHeader() {
  return (
    <div className="mb-5 rounded-2xl border border-white/10 bg-slate-900 p-4 text-white shadow-xl shadow-black/20 md:hidden">
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

  const previousPathnameRef = useRef<string | null>(null);
  const previousIndex = previousPathnameRef.current
    ? AUTH_ROUTE_ORDER.indexOf(previousPathnameRef.current as (typeof AUTH_ROUTE_ORDER)[number])
    : -1;
  const currentIndex = AUTH_ROUTE_ORDER.indexOf(pathname as (typeof AUTH_ROUTE_ORDER)[number]);
  const direction =
    previousIndex === -1 || currentIndex === -1 || currentIndex === previousIndex
      ? 1
      : currentIndex > previousIndex
        ? 1
        : -1;
  previousPathnameRef.current = pathname;

  const panelWidths = {
    compact: "max-w-md",
    standard: "max-w-lg",
    wide: "max-w-2xl",
  } as const;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-950 md:h-screen md:overflow-hidden">
      <div
        className="relative flex min-h-screen flex-col bg-slate-950 md:h-screen md:flex-row md:bg-cover md:bg-center"
        style={{ backgroundImage: "url('/brand/auth-background.png')" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-t from-slate-950/85 via-slate-950/60 to-slate-950/35 md:block"
        />

        <AuthBrandPanel />

        <section className="relative z-10 flex min-h-screen flex-1 items-center justify-center bg-transparent px-3 py-4 sm:px-6 md:h-screen md:min-h-0 md:w-[52%] md:flex-none md:justify-start md:px-6 md:py-5 lg:px-8 xl:px-10">
          <div className={`w-full ${panelWidths[panelWidth]}`}>
            <AuthMobileHeader />

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={pathname}
                custom={direction}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                 <div className="auth-panel-card min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-black/30 sm:rounded-[30px] sm:p-6 lg:min-h-[500px] lg:p-6">
                  <div className="mb-4 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      {eyebrow}
                    </p>

                    <h1 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-[1.9rem]">
                      {title}
                    </h1>

                    <p className="max-w-xl text-sm leading-6 text-slate-500">
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
