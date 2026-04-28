import { CalendarClock, CarFront, MapPinned, ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";

const summaryCards = [
  {
    title: "Assigned vehicle",
    value: "Planned",
    description: "Vehicle assignment panels can appear here without changing the shared shell.",
    icon: CarFront,
  },
  {
    title: "Trip visibility",
    value: "Ready",
    description: "Trip history and task summaries can slot into the same responsive card system.",
    icon: MapPinned,
  },
];

export default function DriverDashboardPage() {
  return (
    <DashboardShell
      title="Driver Dashboard"
      description="Stay focused on assigned work, trip visibility, and personal operational tasks from one clear workspace."
    >
      <section className="grid gap-4 md:grid-cols-2">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
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

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Driver-focused structure</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                The driver workspace now matches the same enterprise system used elsewhere, with a calmer shell and cleaner content surfaces for future task flows.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Planned experience
          </p>
          <div className="mt-4 space-y-3">
            {[
              "Assigned vehicle and trip context at a glance",
              "Fuel activity summaries with simple next steps",
              "Personal account and credential management",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-amber-300" />
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
