import { CheckCircle2, Clock3, FileCheck2, ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";

const summaryCards = [
  {
    title: "Approval queue",
    value: "Ready",
    description: "Structured review tools can be surfaced here as approver features expand.",
    icon: Clock3,
  },
  {
    title: "Decision history",
    value: "Tracked",
    description: "Review outcomes and audit context can be surfaced in a dedicated timeline.",
    icon: FileCheck2,
  },
];

export default function ApproverDashboardPage() {
  return (
    <DashboardShell
      title="Approver Dashboard"
      description="Review operational requests, keep decisions consistent, and maintain a clean approval trail."
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

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">Workspace readiness</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                This approver area now follows the same dark-sidebar and light-workspace system as the rest of VFMS, so future review modules can land in a consistent structure.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Next capabilities
          </p>
          <div className="mt-4 space-y-3">
            {[
              "Pending request queues with filters and review badges",
              "Approval and rejection decision flows with evidence context",
              "History panels for audit visibility and follow-up actions",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-amber-300" />
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
