import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Droplets,
  ShieldCheck,
  Users,
} from "lucide-react";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  actionLabel: string;
  actionHref: string;
  footer?: ReactNode;
  panelWidth?: "compact" | "standard" | "wide";
}

const brandPoints = [
  {
    title: "Role-based entry",
    description:
      "Separate journeys for administrators, approvers, staff, and drivers with one shared UX system.",
    icon: ShieldCheck,
  },
  {
    title: "Consistent workflows",
    description:
      "Registration, approvals, and operational tasks follow the same calm patterns across the platform.",
    icon: Users,
  },
  {
    title: "Operational trust",
    description:
      "Fuel records, user actions, and account states stay clear, reviewable, and easy to manage.",
    icon: Droplets,
  },
  {
    title: "Designed for fast task completion",
    description:
      "Strong hierarchy, readable forms, and restrained motion help users move through sign-in, registration, verification, and recovery flows with confidence.",
    icon: BadgeCheck,
  },
];

function AuthBrandPanel() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[30rem] xl:w-[34rem]">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden border-r border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-10 py-12 text-white xl:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.12),_transparent_18%)]" />
        <div className="absolute left-[-5rem] top-[-4rem] h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-4rem] h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-base font-black text-slate-950 shadow-lg shadow-amber-400/20">
              V
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                Kiruthiyan
              </p>
              <p className="text-lg font-bold tracking-tight text-white">
                VFMS Platform
              </p>
            </div>
          </Link>

          <div className="mt-12 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">
              Secure platform access
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-white xl:text-5xl">
                Access VFMS with clarity, trust, and one consistent workflow.
              </h1>
              <p className="text-base leading-7 text-slate-300">
                The authentication experience matches the same professional dashboard language used across user management, fuel operations, and approval workflows.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4">
            {brandPoints.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-slate-800 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-white">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

function AuthMobileHeader() {
  return (
    <div className="mb-6 rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:hidden">
      <Link href="/" className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-amber-400 shadow-sm">
          V
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
            Kiruthiyan
          </p>
          <p className="text-base font-bold tracking-tight text-slate-950">
            VFMS Platform
          </p>
        </div>
      </Link>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Secure platform access
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Access VFMS with clarity, trust, and one consistent workflow.
        </p>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  description,
  children,
  actionLabel,
  actionHref,
  footer,
  panelWidth = "standard",
}: AuthShellProps) {
  const panelWidths = {
    compact: "max-w-lg",
    standard: "max-w-2xl",
    wide: "max-w-4xl",
  } as const;

  return (
    <main className="app-shell-background min-h-screen text-slate-950">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.12),_transparent_18%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]" />
        <div className="absolute right-[-10rem] top-[6rem] h-[24rem] w-[24rem] rounded-full bg-slate-200/70 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[25%] h-[18rem] w-[18rem] rounded-full bg-amber-100/40 blur-3xl" />
      </div>

      <AuthBrandPanel />

      <section className="min-h-screen lg:ml-[30rem] xl:ml-[34rem]">
        <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 lg:px-10 lg:py-10 xl:px-14">
          <div className={`w-full ${panelWidths[panelWidth]}`}>
            <AuthMobileHeader />

            <div className="mb-5 flex justify-end">
              <Link
                href={actionHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-950 active:scale-[0.99]"
              >
                {actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="app-surface-card rounded-[32px] p-6 sm:p-8 lg:p-9">
              <div className="mb-8 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Account access
                </p>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {title}
                </h1>
                <p className="max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                  {description}
                </p>
              </div>

              {children}
            </div>

            {footer ? <div className="mt-6">{footer}</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
