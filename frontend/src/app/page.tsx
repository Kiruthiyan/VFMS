import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Fuel,
  ShieldCheck,
  Users,
  Waypoints,
} from "lucide-react";

import { FleetProLogo } from "@/components/branding/fleetpro-logo";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Access", href: "#access" },
] as const;

const featureCards = [
  {
    title: "Verified access",
    description:
      "Register verified company staff and manage platform access through a controlled workflow.",
    icon: Users,
  },
  {
    title: "Fleet operations",
    description:
      "Manage vehicle records, fuel activity, and daily fleet operations from one workspace.",
    icon: Fuel,
  },
  {
    title: "Approval visibility",
    description:
      "Support approvals with cleaner review flows, better traceability, and stronger accountability.",
    icon: ShieldCheck,
  },
] as const;

const quickPoints = [
  "Role-based dashboard access",
  "Verified staff onboarding",
  "Vehicle and fuel operation records",
] as const;

const capabilityCards = [
  {
    title: "Staff onboarding",
    description:
      "Allow verified company staff to register using official employee records.",
  },
  {
    title: "Admin control",
    description:
      "Create users, assign roles, manage account status, and control access lifecycle.",
  },
  {
    title: "Fuel records",
    description:
      "Record fuel usage with validation, cost calculation, and operational monitoring.",
  },
  {
    title: "Direct dashboards",
    description:
      "Send users directly to the correct workspace after successful sign in.",
  },
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="FleetPro home">
            <FleetProLogo theme="light" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/auth/login">Login</Link>
            </Button>

            <Button asChild className="shadow-sm">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <section
        id="platform"
        className="border-b border-slate-200 bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Company fleet management platform
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[3.45rem]">
                FleetPro brings fleet access, approvals, and records into one
                professional system.
              </h1>

              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                A secure company platform for verified staff access, role-based
                dashboards, vehicle records, fuel operations, and approval
                workflows.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-[12rem]">
                <Link href="/auth/signup">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-[12rem] border-slate-300 bg-white"
              >
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {quickPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] sm:p-6">
            <div className="rounded-[1.7rem] bg-slate-950 p-6 text-white sm:p-7">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                    FleetPro workspace
                  </p>

                  <h2 className="mt-3 text-2xl font-black tracking-tight">
                    Clear access for modern fleet teams.
                  </h2>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-300">
                  <Waypoints className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 grid gap-3">
                {featureCards.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300/12 text-amber-300">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="space-y-1.5">
                        <p className="font-semibold text-white">{title}</p>
                        <p className="text-sm leading-6 text-slate-300">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <p className="text-sm font-semibold text-amber-200">
                  Built for secure company operations
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Users sign in through a controlled access flow and continue
                  directly to their assigned FleetPro dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Capabilities
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Everything needed for controlled fleet access and daily operations.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              FleetPro keeps the user journey simple while supporting the core
              operational needs of a company vehicle management system.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilityCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-base font-bold text-slate-950">
                  {card.title}
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="access" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white sm:px-10 lg:px-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
              Secure access
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Start with a verified FleetPro account and continue to your
              dashboard.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Staff can register using company details, while existing users can
              sign in and access the correct workspace without unnecessary extra
              pages.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-[12rem]">
                <Link href="/auth/signup">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-[12rem] border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_repeat(2,minmax(0,0.45fr))] lg:px-8">
          <div className="space-y-4">
            <FleetProLogo theme="dark" />

            <p className="max-w-md text-sm leading-7 text-slate-300">
              FleetPro is a professional company platform for secure staff
              access, approval workflows, vehicle operations, and fleet record
              management.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
              Platform
            </p>

            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <Link
                href="#platform"
                className="transition-colors hover:text-white"
              >
                Overview
              </Link>

              <Link
                href="#capabilities"
                className="transition-colors hover:text-white"
              >
                Capabilities
              </Link>

              <Link
                href="#access"
                className="transition-colors hover:text-white"
              >
                Access
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
              Account
            </p>

            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <Link
                href="/auth/login"
                className="transition-colors hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/auth/signup"
                className="transition-colors hover:text-white"
              >
                Sign Up
              </Link>

              <span className="pt-2 text-slate-400">
                © 2026 FleetPro. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}