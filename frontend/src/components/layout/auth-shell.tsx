import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  eyebrow?: string;
  footer?: ReactNode;
  panelWidth?: "compact" | "standard" | "wide";
}


function AuthBrandPanel() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[30rem] xl:w-[40rem]">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden border-r border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-10 py-12 text-white xl:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.12),_transparent_18%)]" />
        <div className="absolute left-[-5rem] top-[-4rem] h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-[-5rem] right-[-4rem] h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          <Link href="/" className="absolute left-0 top-0 flex items-center gap-3">
            <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 backdrop-blur">
              <span className="absolute inset-x-2 top-2 h-1.5 rounded-full bg-amber-300" />
              <span className="absolute left-2 top-5 h-5 w-3 rounded-full border border-amber-300/70" />
              <span className="absolute right-2 top-5 h-5 w-3 rounded-full border border-amber-300/70" />
              <span className="absolute bottom-2 left-1/2 h-1.5 w-6 -translate-x-1/2 rounded-full bg-white/80" />
            </span>
            <div className="text-left">
              <p className="text-lg font-bold tracking-tight text-white">
                FleetPro
              </p>
            </div>
          </Link>

          <div className="mt-12 max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">
              Trusted operations platform
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight text-white xl:text-5xl">
                FleetPro brings users, vehicles, and fuel operations into one secure workspace.
              </h1>
              <p className="text-base leading-7 text-slate-300">
                Built for company teams who need secure access, clear approvals, and reliable fleet records in a professional day-to-day system.
              </p>
            </div>
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
        <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
          <span className="absolute inset-x-2 top-2 h-1.5 rounded-full bg-amber-300" />
          <span className="absolute left-2 top-4.5 h-4.5 w-3 rounded-full border border-amber-300/80" />
          <span className="absolute right-2 top-4.5 h-4.5 w-3 rounded-full border border-amber-300/80" />
          <span className="absolute bottom-2 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full bg-white/90" />
        </span>
        <p className="text-base font-bold tracking-tight text-slate-950">
          FleetPro
        </p>
      </Link>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Trusted operations platform
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          FleetPro brings users, vehicles, and fuel operations into one secure workspace.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Built for company teams who need secure access, clear approvals, and reliable fleet records in a professional day-to-day system.
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
  eyebrow = "Account access",
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

      <section className="min-h-screen lg:ml-[34rem] xl:ml-[40rem]">
        <div className="mx-auto flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6 lg:px-10 lg:py-10 xl:px-14">
          <div className={`w-full ${panelWidths[panelWidth]}`}>
            <AuthMobileHeader />

            <div className="app-surface-card rounded-[32px] p-6 sm:p-8 lg:p-9">
              <div className="mb-8 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  {eyebrow}
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
