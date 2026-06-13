import Link from "next/link";
import {
  Car,
  CalendarDays,
  Wrench,
  MapPin,
  UserCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Award,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DRIVER_PORTAL_ROUTES } from "@/lib/constants/routes";

const summaryCards = [
  {
    title: "My Trips",
    value: "Assigned",
    description:
      "View your current and past trip assignments, scheduled routes, and trip details at a glance.",
    icon: MapPin,
  },
  {
    title: "Leave Requests",
    value: "Managed",
    description:
      "Submit and track your leave applications. View approval status and upcoming leave history.",
    icon: CalendarDays,
  },
  {
    title: "Service Requests",
    value: "Reported",
    description:
      "Report vehicle faults and request maintenance services directly from your driver workspace.",
    icon: Wrench,
  },
];

const quickLinks = [
  {
    label: "My Profile",
    description: "View your driver profile, identity and contact details.",
    href: DRIVER_PORTAL_ROUTES.PROFILE,
    icon: UserCircle,
  },
  {
    label: "Licenses",
    description: "View your primary driving license and expiry status.",
    href: DRIVER_PORTAL_ROUTES.LICENSES,
    icon: CreditCard,
  },
  {
    label: "Certifications",
    description: "Manage your training certifications and qualifications.",
    href: DRIVER_PORTAL_ROUTES.CERTIFICATIONS,
    icon: Award,
  },
  {
    label: "Documents",
    description: "Upload and manage your personal documents.",
    href: DRIVER_PORTAL_ROUTES.DOCUMENTS,
    icon: FileText,
  },
  {
    label: "Infractions",
    description: "View infraction history and submit incident reports.",
    href: DRIVER_PORTAL_ROUTES.INFRACTIONS,
    icon: AlertTriangle,
  },
  {
    label: "My Trips",
    description: "View your assigned and completed trips.",
    href: DRIVER_PORTAL_ROUTES.TRIPS,
    icon: MapPin,
  },
  {
    label: "Leave Requests",
    description: "Submit and track leave applications.",
    href: DRIVER_PORTAL_ROUTES.LEAVE_REQUESTS,
    icon: CalendarDays,
  },
  {
    label: "Service Requests",
    description: "Report vehicle faults or request maintenance.",
    href: DRIVER_PORTAL_ROUTES.SERVICE_REQUESTS,
    icon: Wrench,
  },
];

export default function DriverDashboardPage() {
  return (
    <DashboardShell
      title="Driver Dashboard"
      description="Your personal driver workspace — manage trips, leave, service requests, and your profile from one place."
    >
      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {card.title}
                </p>
                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  {card.value}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <card.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {card.description}
            </p>
          </article>
        ))}
      </section>

      {/* Feature Highlight */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Driver Workspace
              </p>
              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Everything in one place
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your driver dashboard gives you centralized access to trip
                schedules, leave management, vehicle service requests, and your
                personal driver profile — all in one consistent workspace
                designed for clarity and speed.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Available features
          </p>
          <div className="mt-4 space-y-3">
            {[
              "View and track your assigned trips and schedules",
              "Submit leave requests and monitor approval status",
              "Report vehicle faults and request maintenance",
              "Manage licenses, certifications, and personal documents",
              "Report and track infractions and incident history",
              "Access your full driver profile from the dashboard",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-300" />
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Quick Links */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <link.icon className="h-4 w-4" />
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {link.label}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {link.description}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </DashboardShell>
  );
}
