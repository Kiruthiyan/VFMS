import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  FileCheck2,
  LayoutDashboard,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const highlights = [
  {
    title: "Unified administration",
    description:
      "Approve registrations, manage users, and review operational status from one structured dashboard.",
    icon: LayoutDashboard,
  },
  {
    title: "Fuel workflow visibility",
    description:
      "Track logs, review flagged activity, and keep approval context visible across the fuel lifecycle.",
    icon: Droplets,
  },
  {
    title: "Role-aware access",
    description:
      "Give administrators, approvers, staff, and drivers the right tools in one consistent system.",
    icon: ShieldCheck,
  },
];

const roleCards = [
  {
    title: "Administrators",
    description: "Data-rich controls, oversight, approvals, and audit visibility.",
    icon: Users,
  },
  {
    title: "Approvers",
    description: "Simple review queues with clear action states and confident decision flows.",
    icon: FileCheck2,
  },
  {
    title: "Drivers",
    description: "Task-focused workflows built for timely execution and operational clarity.",
    icon: Truck,
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Request and verify access",
    description:
      "Users register through a structured role-based flow with email verification and strong validation.",
  },
  {
    step: "02",
    title: "Approve and manage accounts",
    description:
      "Administrators review requests, approve access, and manage account status within one workspace.",
  },
  {
    step: "03",
    title: "Operate with confidence",
    description:
      "Fuel logs, user tasks, and approvals follow the same consistent dashboard language throughout the platform.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]" />
        <div className="absolute left-[-8rem] top-[-6rem] h-[22rem] w-[22rem] rounded-full bg-amber-100/70 blur-3xl" />
        <div className="absolute right-[-10rem] top-[8rem] h-[28rem] w-[28rem] rounded-full bg-slate-200/70 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-amber-400 shadow-sm">
              V
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Kiruthiyan
              </p>
              <p className="text-sm font-bold tracking-tight text-slate-950">
                VFMS Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">
                Request Access
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.08fr,0.92fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">
              Professional Vehicle Fuel Management
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                One professional system for user access, fuel operations, and approval workflows.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Kiruthiyan VFMS brings registration, administration, and fuel management into one consistent enterprise workspace designed for trust, scanability, and fast task completion.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/auth/login">
                  Open Platform
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-black tracking-tight text-slate-950">4</p>
                <p className="mt-1 text-sm text-slate-500">Core operational roles</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-black tracking-tight text-slate-950">1</p>
                <p className="mt-1 text-sm text-slate-500">Unified dashboard system</p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-black tracking-tight text-slate-950">24/7</p>
                <p className="mt-1 text-sm text-slate-500">Operational visibility</p>
              </article>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                    VFMS Workspace
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">
                    Built for review, action, and audit clarity
                  </h2>
                </div>
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950">
                  Live flow
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    User Management
                  </p>
                  <p className="mt-3 text-lg font-bold text-white">
                    Registration, approval, role control, and account lifecycle management
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Fuel Management
                  </p>
                  <p className="mt-3 text-lg font-bold text-white">
                    Logs, alerts, flagged records, and review-ready operational history
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Dark-sidebar, light-workspace enterprise dashboard language",
                "Rounded cards, consistent forms, and readable action hierarchy",
                "Amber-led primary actions with calm, professional supporting colors",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-medium text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              Platform Highlights
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Everything works like one coherent operational platform
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              VFMS is designed so every page, form, approval, and management action feels connected and easy to understand.
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.92fr,1.08fr]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Built for roles
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              Professional UX for every part of the workflow
            </h2>

            <div className="mt-6 grid gap-4">
              {roleCards.map((role) => {
                const Icon = role.icon;

                return (
                  <div key={role.title} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-950">{role.title}</h3>
                        <p className="text-sm text-slate-500">{role.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Workflow
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Clear from registration to daily operations
            </h2>
            <div className="mt-8 space-y-4">
              {workflowSteps.map((item) => (
                <div key={item.step} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 font-bold text-slate-950">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-slate-900 p-8 text-white shadow-xl shadow-slate-900/10 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr,auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                  Ready to begin?
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Start with a secure account and move into the right workspace.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  VFMS is designed to feel calm, trustworthy, and consistent from the first sign-in to everyday operational work.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                  <Link href="/auth/signup">
                    Create Account
                    <ArrowRight />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
