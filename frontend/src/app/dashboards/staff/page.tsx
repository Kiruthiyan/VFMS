import { ClipboardList, Droplets, ShieldCheck, UserRound } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";

const summaryCards = [
  {
    title: "Request workspace",
    value: "Prepared",
    description: "Fuel request actions can be introduced here without changing the system layout.",
    icon: ClipboardList,
  },
  {
    title: "Fuel history",
    value: "Consistent",
    description: "History, status, and follow-up actions can share the same table and card patterns.",
    icon: Droplets,
  },
];

export default function StaffDashboardPage() {
  return (
    <DashboardShell
      title="Staff Dashboard"
      description="Submit and follow operational requests from a cleaner workspace designed for clarity and quick completion."
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
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Built for request flows</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This staff workspace now uses the same visual rhythm as the rest of the frontend, making it easier to add mobile-friendly operational tasks later.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Upcoming modules
          </p>
          <div className="mt-4 space-y-3">
            {[
              "Simple request creation with strong form clarity",
              "Clear history and request status tracking",
              "Personal profile and security access from one place",
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
